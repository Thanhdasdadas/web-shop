using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Application.Services;

public class CatalogService(
    ICategoryRepository categories,
    IProductRepository products,
    IInventoryRepository inventory) : ICatalogService
{
    public async Task<List<CategoryDto>> GetCategoriesAsync(bool activeOnly, CancellationToken ct = default)
    {
        var all = await categories.GetAllAsync(ct);
        var filtered = activeOnly ? all.Where(c => c.IsActive) : all;
        return filtered.Select(c => new CategoryDto(c.Id, c.Name, c.Slug, c.IsActive)).ToList();
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        var cat = new Category { Name = request.Name, Slug = request.Slug, IsActive = request.IsActive };
        await categories.InsertAsync(cat, ct);
        return new CategoryDto(cat.Id, cat.Name, cat.Slug, cat.IsActive);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(string id, UpdateCategoryRequest request, CancellationToken ct = default)
    {
        var cat = await categories.GetByIdAsync(id, ct) ?? throw new AppException("Danh mục không tồn tại.");
        cat.Name = request.Name;
        cat.Slug = request.Slug;
        cat.IsActive = request.IsActive;
        cat.UpdatedAt = DateTime.UtcNow;
        await categories.UpdateAsync(cat, ct);
        return new CategoryDto(cat.Id, cat.Name, cat.Slug, cat.IsActive);
    }

    public async Task DeleteCategoryAsync(string id, CancellationToken ct = default)
    {
        await categories.DeleteAsync(id, ct);
    }

    public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductQuery query, bool publishedOnly, CancellationToken ct = default)
    {
        var isPublished = publishedOnly ? true : query.IsPublished;
        var paged = await products.GetPagedAsync(
            query.Search, query.CategoryId, isPublished, query.SortBy, query.InStockOnly,
            query.MinPrice, query.MaxPrice, query.Page, query.PageSize, ct);
        var items = new List<ProductDto>();
        foreach (var p in paged.Items)
            items.Add(await MapProductAsync(p, ct));
        return new PagedResult<ProductDto> { Items = items, Page = paged.Page, PageSize = paged.PageSize, TotalCount = paged.TotalCount };
    }

    public async Task<ProductAdminSummaryDto> GetProductAdminSummaryAsync(CancellationToken ct = default)
    {
        var all = await products.GetAllAsync(ct);
        var published = all.Count(p => p.IsPublished);
        var allInv = await inventory.GetAllAsync(ct);
        var lowStock = allInv.Count(i => i.QuantityOnHand <= i.LowStockThreshold);
        return new ProductAdminSummaryDto(
            all.Count, published, all.Count - published, lowStock,
            all.Sum(p => p.ViewCount), all.Sum(p => p.ClickCount), all.Sum(p => p.PurchaseCount));
    }

    public async Task<ProductDto> GetProductByIdAsync(string id, CancellationToken ct = default)
    {
        var p = await products.GetByIdAsync(id, ct) ?? throw new AppException("Sản phẩm không tồn tại.");
        return await MapProductAsync(p, ct);
    }

    public async Task<ProductDto> SetPublishAsync(string id, bool isPublished, CancellationToken ct = default)
    {
        var product = await products.GetByIdAsync(id, ct) ?? throw new AppException("Sản phẩm không tồn tại.");
        product.IsPublished = isPublished;
        product.UpdatedAt = DateTime.UtcNow;
        await products.UpdateAsync(product, ct);
        return await MapProductAsync(product, ct);
    }

    public async Task<ProductDto?> GetProductBySlugAsync(string slug, CancellationToken ct = default)
    {
        var p = await products.GetBySlugAsync(slug, ct);
        return p == null ? null : await MapProductAsync(p, ct);
    }

    public async Task<List<ProductDto>> GetRelatedProductsAsync(string slug, int limit = 4, CancellationToken ct = default)
    {
        var p = await products.GetBySlugAsync(slug, ct);
        if (p == null) return [];
        var related = await products.GetRelatedAsync(p.CategoryId, p.Id, limit, ct);
        var items = new List<ProductDto>();
        foreach (var r in related)
            items.Add(await MapProductAsync(r, ct));
        return items;
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        _ = await categories.GetByIdAsync(request.CategoryId, ct) ?? throw new AppException("Danh mục không tồn tại.");
        var product = new Product
        {
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            Images = request.Images,
            Price = request.Price,
            CategoryId = request.CategoryId,
            Sku = request.Sku,
            IsPublished = request.IsPublished
        };
        await products.InsertAsync(product, ct);
        await inventory.InsertAsync(new Inventory
        {
            ProductId = product.Id,
            QuantityOnHand = request.InitialStock,
            LowStockThreshold = request.LowStockThreshold
        }, ct);
        return await MapProductAsync(product, ct);
    }

    public async Task<ProductDto> UpdateProductAsync(string id, UpdateProductRequest request, CancellationToken ct = default)
    {
        var product = await products.GetByIdAsync(id, ct) ?? throw new AppException("Sản phẩm không tồn tại.");
        product.Name = request.Name;
        product.Slug = request.Slug;
        product.Description = request.Description;
        product.Images = request.Images;
        product.Price = request.Price;
        product.CategoryId = request.CategoryId;
        product.Sku = request.Sku;
        product.IsPublished = request.IsPublished;
        product.UpdatedAt = DateTime.UtcNow;
        await products.UpdateAsync(product, ct);
        return await MapProductAsync(product, ct);
    }

    public async Task DeleteProductAsync(string id, CancellationToken ct = default)
    {
        await products.DeleteAsync(id, ct);
        var inv = await inventory.GetByProductIdAsync(id, ct);
        if (inv != null) await inventory.DeleteAsync(inv.Id, ct);
    }

    public async Task TrackProductViewAsync(string productId, CancellationToken ct = default)
    {
        if (!await products.IncrementMetricAsync(productId, Domain.Enums.ProductMetricType.View, 1, ct))
            throw new AppException("Sản phẩm không tồn tại.");
    }

    public async Task TrackProductClickAsync(string productId, CancellationToken ct = default)
    {
        if (!await products.IncrementMetricAsync(productId, Domain.Enums.ProductMetricType.Click, 1, ct))
            throw new AppException("Sản phẩm không tồn tại.");
    }

    private async Task<ProductDto> MapProductAsync(Product p, CancellationToken ct)
    {
        var cat = await categories.GetByIdAsync(p.CategoryId, ct);
        var inv = await inventory.GetByProductIdAsync(p.Id, ct);
        return new ProductDto(
            p.Id, p.Name, p.Slug, p.Description, p.Images, p.Price, p.CategoryId, cat?.Name, p.Sku, p.IsPublished,
            inv?.QuantityOnHand, p.ViewCount, p.ClickCount, p.PurchaseCount);
    }
}
