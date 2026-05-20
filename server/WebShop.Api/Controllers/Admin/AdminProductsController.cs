using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/products")]
[Authorize(Policy = "StaffOrAdmin")]
public class AdminProductsController(ICatalogService catalog) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<ProductAdminSummaryDto>> GetSummary(CancellationToken ct) =>
        Ok(await catalog.GetProductAdminSummaryAsync(ct));

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetAll([FromQuery] ProductQuery query, CancellationToken ct) =>
        Ok(await catalog.GetProductsAsync(query, publishedOnly: false, ct));

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(string id, CancellationToken ct) =>
        Ok(await catalog.GetProductByIdAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductRequest request, CancellationToken ct) =>
        Ok(await catalog.CreateProductAsync(request, ct));

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDto>> Update(string id, [FromBody] UpdateProductRequest request, CancellationToken ct) =>
        Ok(await catalog.UpdateProductAsync(id, request, ct));

    [HttpPatch("{id}/publish")]
    public async Task<ActionResult<ProductDto>> SetPublish(string id, [FromBody] SetPublishRequest request, CancellationToken ct) =>
        Ok(await catalog.SetPublishAsync(id, request.IsPublished, ct));

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        await catalog.DeleteProductAsync(id, ct);
        return NoContent();
    }
}
