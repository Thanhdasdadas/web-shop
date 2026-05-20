using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers.Admin;

[Authorize(Policy = "StaffOrAdmin")]
[ApiController]
[Route("api/admin/reports")]
public class AdminReportsController(IReportService reports) : ControllerBase
{
    [HttpGet("sales")]
    public async Task<ActionResult<SalesReportDto>> GetSales(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string groupBy = "day",
        CancellationToken ct = default) =>
        Ok(await reports.GetSalesReportAsync(from, to, groupBy, ct));
}
