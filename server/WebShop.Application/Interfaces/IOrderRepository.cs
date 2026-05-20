using WebShop.Application.Common;
using WebShop.Domain.Entities;
using WebShop.Domain.Enums;

namespace WebShop.Application.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<PagedResult<Order>> GetPagedForUserAsync(string userId, int page, int pageSize, CancellationToken ct = default);
    Task<PagedResult<Order>> GetPagedAdminAsync(OrderStatus? status, int page, int pageSize, CancellationToken ct = default);
    Task<List<Order>> GetRecentAsync(int count, CancellationToken ct = default);
    Task<List<Order>> GetDeliveredInRangeAsync(DateTime? from, DateTime? to, CancellationToken ct = default);
    Task<bool> UserHasDeliveredProductAsync(string userId, string productId, CancellationToken ct = default);
}
