namespace WebShop.Application.DTOs;

public record CategoryDto(string Id, string Name, string Slug, bool IsActive);
public record CreateCategoryRequest(string Name, string Slug, bool IsActive = true);
public record UpdateCategoryRequest(string Name, string Slug, bool IsActive);

public record ProductDto(
    string Id, string Name, string Slug, string Description, List<string> Images,
    decimal Price, string CategoryId, string? CategoryName, string Sku, bool IsPublished, int? Stock);

public record CreateProductRequest(
    string Name, string Slug, string Description, List<string> Images,
    decimal Price, string CategoryId, string Sku, bool IsPublished, int InitialStock, int LowStockThreshold);

public record UpdateProductRequest(
    string Name, string Slug, string Description, List<string> Images,
    decimal Price, string CategoryId, string Sku, bool IsPublished);

/// <summary>newest | price_asc | price_desc | name_asc</summary>
public record ProductQuery(
    string? Search,
    string? CategoryId,
    bool? IsPublished = null,
    string? SortBy = null,
    bool? InStockOnly = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    int Page = 1,
    int PageSize = 12);
