using WebShop.Application.Common;
using WebShop.Domain.Entities;

namespace WebShop.Application.Interfaces;

public interface IProductRepository : IRepository<Product>
{
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
