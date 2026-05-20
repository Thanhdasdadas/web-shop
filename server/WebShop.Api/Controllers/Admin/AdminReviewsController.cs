using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers.Admin;

[Authorize(Policy = "StaffOrAdmin")]
[ApiController]
[Route("api/admin/reviews")]
public class AdminReviewsController(IReviewService reviews) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ReviewDto>>> GetAll(
        [FromQuery] bool? approved, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default) =>
        Ok(await reviews.GetAdminReviewsAsync(approved, page, pageSize, ct));

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(string id, CancellationToken ct)
    {
        await reviews.ApproveAsync(id, ct);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        await reviews.DeleteAsync(id, ct);
        return NoContent();
    }
}
