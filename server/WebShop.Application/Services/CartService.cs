using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Application.Services;

public class CartService(
    ICartRepository carts,
    IProductRepository products,
    IInventoryRepository inventory) : ICartService
{
    public async Task<CartDto> GetCartAsync(string? userId, string? sessionId, CancellationToken ct = default)
    {
        var cart = await GetOrCreateCartAsync(userId, sessionId, ct);
        return await MapCartAsync(cart, ct);
    }

    public async Task<CartDto> AddItemAsync(string? userId, string? sessionId, AddToCartRequest request, CancellationToken ct = default)
    {
        var product = await products.GetByIdAsync(request.ProductId, ct)
            ?? throw new AppException("Sản phẩm không tồn tại.");
        if (!product.IsPublished) throw new AppException("Sản phẩm không khả dụng.");

        var inv = await inventory.GetByProductIdAsync(request.ProductId, ct);
        if (inv == null || inv.QuantityOnHand < request.Quantity)
            throw new AppException("Không đủ hàng trong kho.");

        var cart = await GetOrCreateCartAsync(userId, sessionId, ct);
        var existing = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
        if (existing != null)
        {
            var newQty = existing.Quantity + request.Quantity;
            if (inv.QuantityOnHand < newQty) throw new AppException("Không đủ hàng trong kho.");
            existing.Quantity = newQty;
        }
        else
        {
            cart.Items.Add(new CartItem { ProductId = request.ProductId, Quantity = request.Quantity });
        }
        cart.UpdatedAt = DateTime.UtcNow;
        await carts.UpdateAsync(cart, ct);
        return await MapCartAsync(cart, ct);
    }

    public async Task<CartDto> UpdateItemAsync(string? userId, string? sessionId, string productId, UpdateCartItemRequest request, CancellationToken ct = default)
    {
        var cart = await GetOrCreateCartAsync(userId, sessionId, ct);
        var item = cart.Items.FirstOrDefault(i => i.ProductId == productId)
            ?? throw new AppException("Sản phẩm không có trong giỏ.");

        if (request.Quantity <= 0)
        {
            cart.Items.Remove(item);
        }
        else
        {
            var inv = await inventory.GetByProductIdAsync(productId, ct);
            if (inv == null || inv.QuantityOnHand < request.Quantity)
                throw new AppException("Không đủ hàng trong kho.");
            item.Quantity = request.Quantity;
        }
        cart.UpdatedAt = DateTime.UtcNow;
        await carts.UpdateAsync(cart, ct);
        return await MapCartAsync(cart, ct);
    }

    public async Task<CartDto> RemoveItemAsync(string? userId, string? sessionId, string productId, CancellationToken ct = default)
    {
        var cart = await GetOrCreateCartAsync(userId, sessionId, ct);
        cart.Items.RemoveAll(i => i.ProductId == productId);
        cart.UpdatedAt = DateTime.UtcNow;
        await carts.UpdateAsync(cart, ct);
        return await MapCartAsync(cart, ct);
    }

    public async Task MergeSessionCartAsync(string userId, string sessionId, CancellationToken ct = default)
    {
        var sessionCart = await carts.GetBySessionIdAsync(sessionId, ct);
        if (sessionCart == null || sessionCart.Items.Count == 0) return;

        var userCart = await carts.GetByUserIdAsync(userId, ct);
        if (userCart == null)
        {
            sessionCart.UserId = userId;
            sessionCart.SessionId = null;
            await carts.UpdateAsync(sessionCart, ct);
            return;
        }

        foreach (var item in sessionCart.Items)
        {
            var existing = userCart.Items.FirstOrDefault(i => i.ProductId == item.ProductId);
            if (existing != null) existing.Quantity += item.Quantity;
            else userCart.Items.Add(item);
        }
        userCart.UpdatedAt = DateTime.UtcNow;
        await carts.UpdateAsync(userCart, ct);
        await carts.DeleteAsync(sessionCart.Id, ct);
    }

    private async Task<Cart> GetOrCreateCartAsync(string? userId, string? sessionId, CancellationToken ct)
    {
        Cart? cart = null;
        if (!string.IsNullOrEmpty(userId))
            cart = await carts.GetByUserIdAsync(userId, ct);
        else if (!string.IsNullOrEmpty(sessionId))
            cart = await carts.GetBySessionIdAsync(sessionId, ct);

        if (cart != null) return cart;

        cart = new Cart { UserId = userId, SessionId = sessionId };
        return await carts.InsertAsync(cart, ct);
    }

    private async Task<CartDto> MapCartAsync(Cart cart, CancellationToken ct)
    {
        var items = new List<CartItemDto>();
        decimal subtotal = 0;
        foreach (var item in cart.Items)
        {
            var product = await products.GetByIdAsync(item.ProductId, ct);
            if (product == null) continue;
            var inv = await inventory.GetByProductIdAsync(item.ProductId, ct);
            var stock = inv?.QuantityOnHand ?? 0;
            var image = product.Images.FirstOrDefault();
            items.Add(new CartItemDto(product.Id, product.Name, image, product.Price, item.Quantity, stock));
            subtotal += product.Price * item.Quantity;
        }
        return new CartDto(cart.Id, items, subtotal);
    }
}
