using MongoDB.Driver;
using WebShop.Application.Common;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class ProductRepository(MongoDbContext context) : MongoRepository<Product>(context), IProductRepository
{
    public async Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        await Collection.Find(p => p.Slug == slug).FirstOrDefaultAsync(ct);

    public async Task<PagedResult<Product>> GetPagedAsync(string? search, string? categoryId, bool? isPublished, int page, int pageSize, CancellationToken ct = default)
    {
        var filter = Builders<Product>.Filter.Empty;
        if (!string.IsNullOrWhiteSpace(search))
        {
            var regex = new MongoDB.Bson.BsonRegularExpression(search, "i");
            filter &= Builders<Product>.Filter.Or(
                Builders<Product>.Filter.Regex(p => p.Name, regex),
                Builders<Product>.Filter.Regex(p => p.Description, regex));
        }
        if (!string.IsNullOrEmpty(categoryId))
            filter &= Builders<Product>.Filter.Eq(p => p.CategoryId, categoryId);
        if (isPublished.HasValue)
            filter &= Builders<Product>.Filter.Eq(p => p.IsPublished, isPublished.Value);

        var total = await Collection.CountDocumentsAsync(filter, cancellationToken: ct);
        var items = await Collection.Find(filter)
            .SortByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Product> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }
}
