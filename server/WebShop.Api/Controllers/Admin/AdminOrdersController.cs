using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Extensions;
using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Services;
using WebShop.Domain.Enums;

namespace WebShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Policy = "StaffOrAdmin")]
public class AdminOrdersController(IOrderService orders) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderDto>>> GetAll([FromQuery] OrderStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default) =>
        Ok(await orders.GetAdminOrdersAsync(status, page, pageSize, ct));

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetById(string id, CancellationToken ct) =>
        Ok(await orders.GetOrderAsync(id, User.GetUserId(), User.GetUserRole(), ct));

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<OrderDto>> UpdateStatus(string id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct) =>
        Ok(await orders.UpdateStatusAsync(id, request, User.GetUserId(), ct));

    [HttpGet("{id}/history")]
    public async Task<ActionResult<List<OrderStatusHistoryDto>>> GetHistory(string id, CancellationToken ct) =>
        Ok(await orders.GetStatusHistoryAsync(id, ct));
}
