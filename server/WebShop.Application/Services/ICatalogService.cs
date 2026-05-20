using WebShop.Application.Common;
using WebShop.Application.DTOs;

namespace WebShop.Application.Services;

public interface ICatalogService
{
    Task<List<CategoryDto>> GetCategoriesAsync(bool activeOnly, CancellationToken ct = default);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, CancellationToken ct = default);
    Task<CategoryDto> UpdateCategoryAsync(string id, UpdateCategoryRequest request, CancellationToken ct = default);
    Task DeleteCategoryAsync(string id, CancellationToken ct = default);

    Task<PagedResult<ProductDto>> GetProductsAsync(ProductQuery query, bool publishedOnly, CancellationToken ct = default);
    Task<ProductAdminSummaryDto> GetProductAdminSummaryAsync(CancellationToken ct = default);
    Task<ProductDto> GetProductByIdAsync(string id, CancellationToken ct = default);
    Task<ProductDto?> GetProductBySlugAsync(string slug, CancellationToken ct = default);
    Task<List<ProductDto>> GetRelatedProductsAsync(string slug, int limit = 4, CancellationToken ct = default);
    Task<ProductDto> SetPublishAsync(string id, bool isPublished, CancellationToken ct = default);
    Task<ProductDto> CreateProductAsync(CreateProductRequest request, CancellationToken ct = default);
    Task<ProductDto> UpdateProductAsync(string id, UpdateProductRequest request, CancellationToken ct = default);
    Task DeleteProductAsync(string id, CancellationToken ct = default);
    Task TrackProductViewAsync(string productId, CancellationToken ct = default);
    Task TrackProductClickAsync(string productId, CancellationToken ct = default);
}
