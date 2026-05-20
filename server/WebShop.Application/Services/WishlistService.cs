using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Application.Services;

public interface IWishlistService
{
    Task<WishlistDto> GetAsync(string userId, CancellationToken ct = default);
    Task AddAsync(string userId, string productId, CancellationToken ct = default);
    Task RemoveAsync(string userId, string productId, CancellationToken ct = default);
}

public class WishlistService(IWishlistRepository wishlists, IProductRepository products, IInventoryRepository inventory) : IWishlistService
{
    public async Task<WishlistDto> GetAsync(string userId, CancellationToken ct = default)
    {
        var wl = await wishlists.GetByUserIdAsync(userId, ct);
        if (wl == null || wl.ProductIds.Count == 0) return new WishlistDto([]);

        var items = new List<WishlistItemDto>();
        foreach (var pid in wl.ProductIds)
        {
            var p = await products.GetByIdAsync(pid, ct);
            if (p == null) continue;
            var inv = await inventory.GetByProductIdAsync(pid, ct);
            items.Add(new WishlistItemDto(p.Id, p.Name, p.Slug, p.Price, p.Images.FirstOrDefault(), inv?.QuantityOnHand));
        }
        return new WishlistDto(items);
    }

    public async Task AddAsync(string userId, string productId, CancellationToken ct = default)
    {
        _ = await products.GetByIdAsync(productId, ct) ?? throw new AppException("Sản phẩm không tồn tại.");
        var wl = await wishlists.GetByUserIdAsync(userId, ct);
        if (wl == null)
        {
            wl = new Wishlist { UserId = userId, ProductIds = [productId] };
            await wishlists.InsertAsync(wl, ct);
            return;
        }
        if (!wl.ProductIds.Contains(productId))
        {
            wl.ProductIds.Add(productId);
            wl.UpdatedAt = DateTime.UtcNow;
            await wishlists.UpdateAsync(wl, ct);
        }
    }

    public async Task RemoveAsync(string userId, string productId, CancellationToken ct = default)
    {
        var wl = await wishlists.GetByUserIdAsync(userId, ct);
        if (wl == null) return;
        wl.ProductIds.Remove(productId);
        wl.UpdatedAt = DateTime.UtcNow;
        await wishlists.UpdateAsync(wl, ct);
    }
}
