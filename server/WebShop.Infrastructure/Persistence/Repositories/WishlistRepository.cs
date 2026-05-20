using MongoDB.Driver;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class WishlistRepository(MongoDbContext context) : MongoRepository<Wishlist>(context), IWishlistRepository
{
    public async Task<Wishlist?> GetByUserIdAsync(string userId, CancellationToken ct = default) =>
        await Collection.Find(w => w.UserId == userId).FirstOrDefaultAsync(ct);
}
