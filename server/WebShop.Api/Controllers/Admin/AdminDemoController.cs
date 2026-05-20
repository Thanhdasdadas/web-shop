using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using WebShop.Application.DTOs;
using WebShop.Infrastructure.Seed;
using WebShop.Infrastructure.Settings;

namespace WebShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/demo")]
[Authorize(Policy = "AdminOnly")]
public class AdminDemoController(DataSeeder seeder, IOptions<DemoResetSettings> demoReset) : ControllerBase
{
    [HttpGet("reset-status")]
    public ActionResult<DemoResetStatusDto> GetResetStatus()
    {
        if (!demoReset.Value.Enabled)
            return Ok(new DemoResetStatusDto(false, DataSeeder.DemoResetConfirmPhrase));
        return Ok(new DemoResetStatusDto(true, DataSeeder.DemoResetConfirmPhrase));
    }

    [HttpPost("reset")]
    public async Task<ActionResult<DemoResetResultDto>> ResetDemoData(
        [FromBody] DemoResetRequest request,
        CancellationToken ct)
    {
        if (!demoReset.Value.Enabled)
            return StatusCode(403, new { message = "Reset demo bị tắt. Bật DemoReset:Enabled hoặc ALLOW_DEMO_RESET=true." });

        if (!string.Equals(request.ConfirmPhrase?.Trim(), DataSeeder.DemoResetConfirmPhrase, StringComparison.Ordinal))
            return BadRequest(new { message = $"Nhập đúng cụm xác nhận: {DataSeeder.DemoResetConfirmPhrase}" });

        var result = await seeder.ResetDemoDataAsync(ct);
        return Ok(result);
    }
}
