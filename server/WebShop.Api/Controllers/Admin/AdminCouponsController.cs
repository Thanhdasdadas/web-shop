using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers.Admin;

[Authorize(Policy = "StaffOrAdmin")]
[ApiController]
[Route("api/admin/coupons")]
public class AdminCouponsController(ICouponService coupons) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CouponDto>>> GetAll(CancellationToken ct) =>
        Ok(await coupons.GetAllAsync(ct));

    [HttpPost]
    public async Task<ActionResult<CouponDto>> Create([FromBody] CreateCouponRequest request, CancellationToken ct) =>
        Ok(await coupons.CreateAsync(request, ct));

    [HttpPut("{id}")]
    public async Task<ActionResult<CouponDto>> Update(string id, [FromBody] UpdateCouponRequest request, CancellationToken ct) =>
        Ok(await coupons.UpdateAsync(id, request, ct));

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        await coupons.DeleteAsync(id, ct);
        return NoContent();
    }
}
