using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Domain.Enums;

namespace WebShop.Application.Services;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(string userId, string? sessionId, CreateOrderRequest request, CancellationToken ct = default);
    Task<PagedResult<OrderDto>> GetMyOrdersAsync(string userId, int page, int pageSize, CancellationToken ct = default);
    Task<OrderDto> GetOrderAsync(string orderId, string userId, UserRole role, CancellationToken ct = default);
    Task<PagedResult<OrderDto>> GetAdminOrdersAsync(OrderStatus? status, int page, int pageSize, CancellationToken ct = default);
    Task<OrderDto> UpdateStatusAsync(string orderId, UpdateOrderStatusRequest request, string changedBy, CancellationToken ct = default);
    Task<List<OrderStatusHistoryDto>> GetStatusHistoryAsync(string orderId, CancellationToken ct = default);
}
