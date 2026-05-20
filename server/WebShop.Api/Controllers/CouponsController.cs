using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponsController(ICouponService coupons) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("validate")]
    public async Task<ActionResult<ValidateCouponResponse>> Validate([FromBody] ValidateCouponRequest request, CancellationToken ct) =>
        Ok(await coupons.ValidateAsync(request, ct));
}
