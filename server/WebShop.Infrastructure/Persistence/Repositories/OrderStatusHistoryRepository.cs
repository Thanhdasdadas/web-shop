using MongoDB.Driver;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class OrderStatusHistoryRepository(MongoDbContext context) : MongoRepository<OrderStatusHistory>(context), IOrderStatusHistoryRepository
{
    public async Task<List<OrderStatusHistory>> GetByOrderIdAsync(string orderId, CancellationToken ct = default) =>
        await Collection.Find(h => h.OrderId == orderId).SortBy(h => h.CreatedAt).ToListAsync(ct);
}
