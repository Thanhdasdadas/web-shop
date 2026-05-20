using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Extensions;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers;

[Authorize(Policy = "CustomerOnly")]
[ApiController]
[Route("api/wishlist")]
public class WishlistController(IWishlistService wishlist) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<WishlistDto>> Get(CancellationToken ct) =>
        Ok(await wishlist.GetAsync(User.GetUserId(), ct));

    [HttpPost("{productId}")]
    public async Task<IActionResult> Add(string productId, CancellationToken ct)
    {
        await wishlist.AddAsync(User.GetUserId(), productId, ct);
        return NoContent();
    }

    [HttpDelete("{productId}")]
    public async Task<IActionResult> Remove(string productId, CancellationToken ct)
    {
        await wishlist.RemoveAsync(User.GetUserId(), productId, ct);
        return NoContent();
    }
}
