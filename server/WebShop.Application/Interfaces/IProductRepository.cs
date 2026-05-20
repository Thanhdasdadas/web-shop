using WebShop.Application.Common;
using WebShop.Domain.Entities;
using WebShop.Domain.Enums;

namespace WebShop.Application.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<bool> IncrementMetricAsync(string productId, ProductMetricType metric, int amount = 1, CancellationToken ct = default);
    Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<PagedResult<Product>> GetPagedAsync(
        string? search,
        string? categoryId,
        bool? isPublished,
        string? sortBy,
        bool? inStockOnly,
        decimal? minPrice,
        decimal? maxPrice,
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task<List<Product>> GetRelatedAsync(string categoryId, string excludeProductId, int limit, CancellationToken ct = default);
}
