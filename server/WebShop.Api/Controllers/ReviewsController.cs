using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Extensions;
using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ReviewsController(IReviewService reviews, IUserRepository users) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("{productId}/reviews")]
    public async Task<ActionResult<ProductReviewSummaryDto>> GetByProduct(
        string productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default) =>
        Ok(await reviews.GetProductReviewsAsync(productId, page, pageSize, ct));

    [Authorize(Policy = "CustomerOnly")]
    [HttpPost("reviews")]
    public async Task<ActionResult<ReviewDto>> Create([FromBody] CreateReviewRequest request, CancellationToken ct)
    {
        var user = await users.GetByIdAsync(User.GetUserId(), ct);
        return Ok(await reviews.CreateAsync(User.GetUserId(), user?.FullName ?? "Khách", request, ct));
    }
}
