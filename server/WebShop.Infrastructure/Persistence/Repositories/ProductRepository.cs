using MongoDB.Driver;
using WebShop.Application.Common;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;
using WebShop.Domain.Enums;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class ProductRepository(MongoDbContext context) : MongoRepository<Product>(context), IProductRepository
{
    private readonly MongoDbContext _db = context;

    public async Task<bool> IncrementMetricAsync(string productId, ProductMetricType metric, int amount = 1, CancellationToken ct = default)
    {
        if (amount <= 0) return false;
        var field = metric switch
        {
            ProductMetricType.View => nameof(Product.ViewCount),
            ProductMetricType.Click => nameof(Product.ClickCount),
            ProductMetricType.Purchase => nameof(Product.PurchaseCount),
            _ => throw new ArgumentOutOfRangeException(nameof(metric))
        };
        var update = Builders<Product>.Update
            .Inc(field, amount)
            .Set(p => p.UpdatedAt, DateTime.UtcNow);
        var result = await Collection.UpdateOneAsync(p => p.Id == productId, update, cancellationToken: ct);
        return result.ModifiedCount > 0 || result.MatchedCount > 0;
    }

    public async Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        await Collection.Find(p => p.Slug == slug).FirstOrDefaultAsync(ct);

    public async Task<List<Product>> GetRelatedAsync(string categoryId, string excludeProductId, int limit, CancellationToken ct = default) =>
        await Collection.Find(p => p.CategoryId == categoryId && p.Id != excludeProductId && p.IsPublished)
            .SortByDescending(p => p.CreatedAt)
            .Limit(limit)
            .ToListAsync(ct);

    public async Task<PagedResult<Product>> GetPagedAsync(
        string? search,
        string? categoryId,
        bool? isPublished,
        string? sortBy,
        bool? inStockOnly,
        decimal? minPrice,
        decimal? maxPrice,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var filter = Builders<Product>.Filter.Empty;
        if (!string.IsNullOrWhiteSpace(search))
        {
            var regex = new MongoDB.Bson.BsonRegularExpression(search, "i");
            filter &= Builders<Product>.Filter.Or(
                Builders<Product>.Filter.Regex(p => p.Name, regex),
                Builders<Product>.Filter.Regex(p => p.Sku, regex),
                Builders<Product>.Filter.Regex(p => p.Description, regex));
        }
        if (!string.IsNullOrEmpty(categoryId))
            filter &= Builders<Product>.Filter.Eq(p => p.CategoryId, categoryId);
        if (isPublished.HasValue)
            filter &= Builders<Product>.Filter.Eq(p => p.IsPublished, isPublished.Value);
        if (minPrice.HasValue)
            filter &= Builders<Product>.Filter.Gte(p => p.Price, minPrice.Value);
        if (maxPrice.HasValue)
            filter &= Builders<Product>.Filter.Lte(p => p.Price, maxPrice.Value);

        if (inStockOnly == true)
        {
            var invCol = _db.GetCollection<Inventory>();
            var inStockIds = await invCol.Find(i => i.QuantityOnHand > 0).Project(i => i.ProductId).ToListAsync(ct);
            filter &= Builders<Product>.Filter.In(p => p.Id, inStockIds);
        }

        var sort = sortBy?.ToLowerInvariant() switch
        {
            "price_asc" => Builders<Product>.Sort.Ascending(p => p.Price),
            "price_desc" => Builders<Product>.Sort.Descending(p => p.Price),
            "name_asc" => Builders<Product>.Sort.Ascending(p => p.Name),
            "views_desc" => Builders<Product>.Sort.Descending(p => p.ViewCount),
            "clicks_desc" => Builders<Product>.Sort.Descending(p => p.ClickCount),
            "purchases_desc" => Builders<Product>.Sort.Descending(p => p.PurchaseCount),
            _ => Builders<Product>.Sort.Descending(p => p.CreatedAt),
        };

        var total = await Collection.CountDocumentsAsync(filter, cancellationToken: ct);
        var items = await Collection.Find(filter)
            .Sort(sort)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Product> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }
}
