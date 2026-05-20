using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Policy = "StaffOrAdmin")]
public class AdminDashboardController(IDashboardService dashboard) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary(CancellationToken ct) =>
        Ok(await dashboard.GetSummaryAsync(ct));
}
