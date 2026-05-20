using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Extensions;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/inventory")]
[Authorize(Policy = "StaffOrAdmin")]
public class AdminInventoryController(IInventoryService inventory) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<InventoryDto>>> GetAll(CancellationToken ct) =>
        Ok(await inventory.GetAllAsync(ct));

    [HttpPost("adjust")]
    public async Task<ActionResult<InventoryDto>> Adjust([FromBody] AdjustInventoryRequest request, CancellationToken ct) =>
        Ok(await inventory.AdjustAsync(User.GetUserId(), request, ct));

    [HttpGet("logs")]
    public async Task<ActionResult<List<InventoryLogDto>>> GetLogs([FromQuery] int limit = 50, CancellationToken ct = default) =>
        Ok(await inventory.GetLogsAsync(limit, ct));
}
