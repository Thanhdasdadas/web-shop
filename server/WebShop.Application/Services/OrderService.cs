using FluentValidation;
using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;
using WebShop.Domain.Enums;

namespace WebShop.Application.Services;

public class OrderService(
    IOrderRepository orders,
    IOrderStatusHistoryRepository history,
    ICartRepository carts,
    IProductRepository products,
    IInventoryRepository inventory,
    ICouponService coupons,
    ISavedAddressService savedAddresses,
    IValidator<CreateOrderRequest> createOrderValidator) : IOrderService
{
    private const decimal DefaultShippingFee = 30000m;

    public async Task<OrderDto> CreateOrderAsync(string userId, string? sessionId, CreateOrderRequest request, CancellationToken ct = default)
    {
        var validation = await createOrderValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            throw new AppException(string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)));

        var cart = !string.IsNullOrEmpty(userId)
            ? await carts.GetByUserIdAsync(userId, ct)
            : !string.IsNullOrEmpty(sessionId) ? await carts.GetBySessionIdAsync(sessionId, ct) : null;

        if (cart == null || cart.Items.Count == 0)
            throw new AppException("Giỏ hàng trống.");

        var shipping = await savedAddresses.ResolveForCheckoutAsync(
            userId, request.SavedAddressId, request.ShippingAddress, ct);

        var orderItems = new List<OrderItem>();
        decimal subtotal = 0;

        foreach (var cartItem in cart.Items)
        {
            var product = await products.GetByIdAsync(cartItem.ProductId, ct)
                ?? throw new AppException($"Sản phẩm không tồn tại: {cartItem.ProductId}");

            var decremented = await inventory.DecrementStockAsync(cartItem.ProductId, cartItem.Quantity, ct);
            if (!decremented)
                throw new AppException($"Không đủ hàng cho sản phẩm: {product.Name}");

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Sku = product.Sku,
                UnitPrice = product.Price,
                Quantity = cartItem.Quantity
            });
            subtotal += product.Price * cartItem.Quantity;
        }

        decimal discount = 0;
        string? couponCode = null;
        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            discount = await coupons.ApplyAndIncrementAsync(request.CouponCode, subtotal, ct);
            couponCode = request.CouponCode.Trim().ToUpperInvariant();
        }

        var order = new Order
        {
            OrderNumber = $"WS{DateTime.UtcNow:yyyyMMddHHmmss}{Random.Shared.Next(1000, 9999)}",
            UserId = userId,
            Items = orderItems,
            ShippingAddress = new ShippingAddress
            {
                FullName = shipping.FullName,
                Phone = shipping.Phone,
                AddressLine = shipping.AddressLine,
                Ward = shipping.Ward ?? string.Empty,
                District = shipping.District,
                City = shipping.City
            },
            Subtotal = subtotal,
            DiscountAmount = discount,
            CouponCode = couponCode,
            ShippingFee = DefaultShippingFee,
            Total = subtotal - discount + DefaultShippingFee,
            Status = OrderStatus.Pending,
            PaymentMethod = PaymentMethod.COD,
            PaymentStatus = PaymentStatus.Pending,
            Note = request.Note
        };

        await orders.InsertAsync(order, ct);

        foreach (var item in orderItems)
            await products.IncrementMetricAsync(item.ProductId, ProductMetricType.Purchase, item.Quantity, ct);

        await history.InsertAsync(new OrderStatusHistory
        {
            OrderId = order.Id,
            FromStatus = null,
            ToStatus = OrderStatus.Pending,
            Note = "Đặt hàng mới",
            ChangedBy = userId
        }, ct);

        cart.Items.Clear();
        cart.UpdatedAt = DateTime.UtcNow;
        await carts.UpdateAsync(cart, ct);

        return MapOrder(order);
    }

    public async Task<PagedResult<OrderDto>> GetMyOrdersAsync(string userId, int page, int pageSize, CancellationToken ct = default)
    {
        var paged = await orders.GetPagedForUserAsync(userId, page, pageSize, ct);
        return new PagedResult<OrderDto>
        {
            Items = paged.Items.Select(MapOrder).ToList(),
            Page = paged.Page,
            PageSize = paged.PageSize,
            TotalCount = paged.TotalCount
        };
    }

    public async Task<OrderDto> GetOrderAsync(string orderId, string userId, UserRole role, CancellationToken ct = default)
    {
        var order = await orders.GetByIdAsync(orderId, ct) ?? throw new AppException("Đơn hàng không tồn tại.");
        if (role == UserRole.Customer && order.UserId != userId)
            throw new AppException("Không có quyền xem đơn hàng này.", 403);
        return MapOrder(order);
    }

    public async Task<PagedResult<OrderDto>> GetAdminOrdersAsync(OrderStatus? status, int page, int pageSize, CancellationToken ct = default)
    {
        var paged = await orders.GetPagedAdminAsync(status, page, pageSize, ct);
        return new PagedResult<OrderDto>
        {
            Items = paged.Items.Select(MapOrder).ToList(),
            Page = paged.Page,
            PageSize = paged.PageSize,
            TotalCount = paged.TotalCount
        };
    }

    public async Task<OrderDto> UpdateStatusAsync(string orderId, UpdateOrderStatusRequest request, string changedBy, CancellationToken ct = default)
    {
        var order = await orders.GetByIdAsync(orderId, ct) ?? throw new AppException("Đơn hàng không tồn tại.");

        if (order.Status == OrderStatus.Cancelled || order.Status == OrderStatus.Delivered)
            throw new AppException("Không thể thay đổi trạng thái đơn hàng này.");

        var from = order.Status;
        order.Status = request.Status;
        order.Note = request.Note ?? order.Note;
        order.UpdatedAt = DateTime.UtcNow;

        if (request.Status == OrderStatus.Delivered)
            order.PaymentStatus = PaymentStatus.Paid;

        if (request.Status == OrderStatus.Cancelled && from != OrderStatus.Cancelled)
        {
            foreach (var item in order.Items)
            {
                var inv = await inventory.GetByProductIdAsync(item.ProductId, ct);
                if (inv != null)
                {
                    inv.QuantityOnHand += item.Quantity;
                    inv.UpdatedAt = DateTime.UtcNow;
                    await inventory.UpdateAsync(inv, ct);
                }
            }
        }

        await orders.UpdateAsync(order, ct);
        await history.InsertAsync(new OrderStatusHistory
        {
            OrderId = order.Id,
            FromStatus = from,
            ToStatus = request.Status,
            Note = request.Note,
            ChangedBy = changedBy
        }, ct);

        return MapOrder(order);
    }

    public async Task<List<OrderStatusHistoryDto>> GetStatusHistoryAsync(string orderId, CancellationToken ct = default)
    {
        var items = await history.GetByOrderIdAsync(orderId, ct);
        return items.Select(h => new OrderStatusHistoryDto(h.FromStatus, h.ToStatus, h.Note, h.ChangedBy, h.CreatedAt)).ToList();
    }

    private static OrderDto MapOrder(Order o) => new(
        o.Id, o.OrderNumber, o.Status, o.PaymentStatus, o.PaymentMethod,
        o.Items.Select(i => new OrderItemDto(i.ProductId, i.ProductName, i.Sku, i.UnitPrice, i.Quantity, i.LineTotal)).ToList(),
        new ShippingAddressDto(o.ShippingAddress.FullName, o.ShippingAddress.Phone, o.ShippingAddress.AddressLine,
            o.ShippingAddress.Ward, o.ShippingAddress.District, o.ShippingAddress.City),
        o.Subtotal, o.DiscountAmount, o.CouponCode, o.ShippingFee, o.Total, o.Note, o.CreatedAt);
}
