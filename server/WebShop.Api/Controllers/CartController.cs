using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Extensions;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController(ICartService cart) : ControllerBase
{
    private string? UserId => User.Identity?.IsAuthenticated == true ? User.GetUserId() : null;
    private string? SessionId => Request.Headers["X-Session-Id"].FirstOrDefault();

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<CartDto>> Get(CancellationToken ct) =>
        Ok(await cart.GetCartAsync(UserId, SessionId, ct));

    [AllowAnonymous]
    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddItem([FromBody] AddToCartRequest request, CancellationToken ct) =>
        Ok(await cart.AddItemAsync(UserId, SessionId, request, ct));

    [AllowAnonymous]
    [HttpPatch("items/{productId}")]
    public async Task<ActionResult<CartDto>> UpdateItem(string productId, [FromBody] UpdateCartItemRequest request, CancellationToken ct) =>
        Ok(await cart.UpdateItemAsync(UserId, SessionId, productId, request, ct));

    [AllowAnonymous]
    [HttpDelete("items/{productId}")]
    public async Task<ActionResult<CartDto>> RemoveItem(string productId, CancellationToken ct) =>
        Ok(await cart.RemoveItemAsync(UserId, SessionId, productId, ct));

    [Authorize(Policy = "CustomerOnly")]
    [HttpPost("merge")]
    public async Task<IActionResult> Merge(CancellationToken ct)
    {
        var sessionId = SessionId;
        if (string.IsNullOrEmpty(sessionId)) return BadRequest(new { message = "Thiếu X-Session-Id." });
        await cart.MergeSessionCartAsync(User.GetUserId(), sessionId, ct);
        return NoContent();
    }
}
