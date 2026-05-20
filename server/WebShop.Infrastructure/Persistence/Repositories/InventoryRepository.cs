using MongoDB.Driver;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class InventoryRepository(MongoDbContext context) : MongoRepository<Inventory>(context), IInventoryRepository
{
    public async Task<Inventory?> GetByProductIdAsync(string productId, CancellationToken ct = default) =>
        await Collection.Find(i => i.ProductId == productId).FirstOrDefaultAsync(ct);

    public async Task<bool> DecrementStockAsync(string productId, int quantity, CancellationToken ct = default)
    {
        var filter = Builders<Inventory>.Filter.And(
            Builders<Inventory>.Filter.Eq(i => i.ProductId, productId),
            Builders<Inventory>.Filter.Gte(i => i.QuantityOnHand, quantity));

        var update = Builders<Inventory>.Update
            .Inc(i => i.QuantityOnHand, -quantity)
            .Set(i => i.UpdatedAt, DateTime.UtcNow);

        var result = await Collection.UpdateOneAsync(filter, update, cancellationToken: ct);
        return result.ModifiedCount > 0;
    }
}
