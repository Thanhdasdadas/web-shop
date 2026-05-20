using WebShop.Domain.Entities;

namespace WebShop.Application.Interfaces;

public interface IOrderStatusHistoryRepository : IRepository<OrderStatusHistory>
{
    Task<List<OrderStatusHistory>> GetByOrderIdAsync(string orderId, CancellationToken ct = default);
}
