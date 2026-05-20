using MongoDB.Driver;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class CartRepository(MongoDbContext context) : MongoRepository<Cart>(context), ICartRepository
{
    public async Task<Cart?> GetByUserIdAsync(string userId, CancellationToken ct = default) =>
        await Collection.Find(c => c.UserId == userId).FirstOrDefaultAsync(ct);

    public async Task<Cart?> GetBySessionIdAsync(string sessionId, CancellationToken ct = default) =>
        await Collection.Find(c => c.SessionId == sessionId).FirstOrDefaultAsync(ct);
}
