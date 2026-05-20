using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Domain.Enums;
using WebShop.Infrastructure.Export;

namespace WebShop.Api.Controllers.Admin;

[Authorize(Policy = "StaffOrAdmin")]
[ApiController]
[Route("api/admin/export")]
public class AdminExportController(IExportService export) : ControllerBase
{
  [HttpGet("orders")]
  public async Task<IActionResult> ExportOrders([FromQuery] OrderStatus? status, CancellationToken ct)
  {
    var bytes = await export.ExportOrdersAsync(status, ct);
    return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"don-hang-{DateTime.UtcNow:yyyyMMdd}.xlsx");
  }

  [HttpGet("products")]
  public async Task<IActionResult> ExportProducts(CancellationToken ct)
  {
    var bytes = await export.ExportProductsAsync(ct);
    return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"san-pham-{DateTime.UtcNow:yyyyMMdd}.xlsx");
  }
}
