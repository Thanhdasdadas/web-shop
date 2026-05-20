using MongoDB.Driver;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class CategoryRepository(MongoDbContext context) : MongoRepository<Category>(context), ICategoryRepository
{
    public async Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        await Collection.Find(c => c.Slug == slug).FirstOrDefaultAsync(ct);
}
