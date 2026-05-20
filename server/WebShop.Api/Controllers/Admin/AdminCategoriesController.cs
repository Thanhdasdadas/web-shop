using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Policy = "StaffOrAdmin")]
public class AdminCategoriesController(ICatalogService catalog) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll(CancellationToken ct) =>
        Ok(await catalog.GetCategoriesAsync(activeOnly: false, ct));

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest request, CancellationToken ct) =>
        Ok(await catalog.CreateCategoryAsync(request, ct));

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> Update(string id, [FromBody] UpdateCategoryRequest request, CancellationToken ct) =>
        Ok(await catalog.UpdateCategoryAsync(id, request, ct));

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        await catalog.DeleteCategoryAsync(id, ct);
        return NoContent();
    }
}
