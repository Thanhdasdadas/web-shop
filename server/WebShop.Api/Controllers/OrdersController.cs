using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Extensions;
using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize(Policy = "CustomerOnly")]
public class OrdersController(IOrderService orders) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create([FromBody] CreateOrderRequest request, CancellationToken ct)
    {
        var sessionId = Request.Headers["X-Session-Id"].FirstOrDefault();
        return Ok(await orders.CreateOrderAsync(User.GetUserId(), sessionId, request, ct));
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderDto>>> GetMine([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default) =>
        Ok(await orders.GetMyOrdersAsync(User.GetUserId(), page, pageSize, ct));

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetById(string id, CancellationToken ct) =>
        Ok(await orders.GetOrderAsync(id, User.GetUserId(), User.GetUserRole(), ct));
}
