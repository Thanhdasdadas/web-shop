using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(ICatalogService catalog) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetAll([FromQuery] ProductQuery query, CancellationToken ct) =>
        Ok(await catalog.GetProductsAsync(query, publishedOnly: true, ct));

    [AllowAnonymous]
    [HttpGet("{slug}/related")]
    public async Task<ActionResult<List<ProductDto>>> GetRelated(string slug, [FromQuery] int limit = 4, CancellationToken ct = default) =>
        Ok(await catalog.GetRelatedProductsAsync(slug, limit, ct));

    [AllowAnonymous]
    [HttpGet("{slug}")]
    public async Task<ActionResult<ProductDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var product = await catalog.GetProductBySlugAsync(slug, ct);
        return product == null ? NotFound() : Ok(product);
    }
}
