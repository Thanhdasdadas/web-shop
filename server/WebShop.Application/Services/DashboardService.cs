using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Enums;

namespace WebShop.Application.Services;

public class DashboardService(
    IOrderRepository orders,
    IInventoryRepository inventory,
    IProductRepository products) : IDashboardService
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct = default)
    {
        var allOrders = await orders.GetAllAsync(ct);
        var delivered = allOrders.Where(o => o.Status == OrderStatus.Delivered).ToList();
        var totalRevenue = delivered.Sum(o => o.Total);

        var ordersByStatus = allOrders
            .GroupBy(o => o.Status.ToString())
            .ToDictionary(g => g.Key, g => (long)g.Count());

        var allInventory = await inventory.GetAllAsync(ct);
        var lowStock = new List<LowStockProductDto>();
        foreach (var inv in allInventory.Where(i => i.QuantityOnHand <= i.LowStockThreshold))
        {
            var product = await products.GetByIdAsync(inv.ProductId, ct);
            if (product != null)
                lowStock.Add(new LowStockProductDto(inv.ProductId, product.Name, inv.QuantityOnHand, inv.LowStockThreshold));
        }

        var recent = await orders.GetRecentAsync(5, ct);
        var recentDtos = recent.Select(o => new OrderDto(
            o.Id, o.OrderNumber, o.Status, o.PaymentStatus, o.PaymentMethod,
            o.Items.Select(i => new OrderItemDto(i.ProductId, i.ProductName, i.Sku, i.UnitPrice, i.Quantity, i.LineTotal)).ToList(),
            new ShippingAddressDto(o.ShippingAddress.FullName, o.ShippingAddress.Phone, o.ShippingAddress.AddressLine,
                o.ShippingAddress.Ward, o.ShippingAddress.District, o.ShippingAddress.City),
            o.Subtotal, o.ShippingFee, o.Total, o.Note, o.CreatedAt)).ToList();

        return new DashboardSummaryDto(totalRevenue, allOrders.Count, ordersByStatus, lowStock, recentDtos);
    }
}
