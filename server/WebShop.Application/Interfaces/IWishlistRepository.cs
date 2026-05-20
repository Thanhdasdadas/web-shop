using WebShop.Domain.Entities;

namespace WebShop.Application.Interfaces;

public interface IWishlistRepository : IRepository<Wishlist>
{
    Task<Wishlist?> GetByUserIdAsync(string userId, CancellationToken ct = default);
}
