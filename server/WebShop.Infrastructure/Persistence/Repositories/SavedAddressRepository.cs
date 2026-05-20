using MongoDB.Driver;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class SavedAddressRepository(MongoDbContext context) : MongoRepository<SavedAddress>(context), ISavedAddressRepository
{
    public async Task<List<SavedAddress>> GetByUserIdAsync(string userId, CancellationToken ct = default) =>
        await Collection.Find(a => a.UserId == userId).SortByDescending(a => a.IsDefault).ThenByDescending(a => a.CreatedAt).ToListAsync(ct);
}
