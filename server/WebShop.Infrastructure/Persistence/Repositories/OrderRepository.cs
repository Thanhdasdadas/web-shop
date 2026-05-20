using MongoDB.Driver;
using WebShop.Application.Common;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;
using WebShop.Domain.Enums;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class OrderRepository(MongoDbContext context) : MongoRepository<Order>(context), IOrderRepository
{
    public async Task<PagedResult<Order>> GetPagedForUserAsync(string userId, int page, int pageSize, CancellationToken ct = default)
    {
        var filter = Builders<Order>.Filter.Eq(o => o.UserId, userId);
        return await GetPagedAsync(filter, page, pageSize, ct);
    }

    public async Task<PagedResult<Order>> GetPagedAdminAsync(OrderStatus? status, int page, int pageSize, CancellationToken ct = default)
    {
        var filter = Builders<Order>.Filter.Empty;
        if (status.HasValue)
            filter = Builders<Order>.Filter.Eq(o => o.Status, status.Value);
        return await GetPagedAsync(filter, page, pageSize, ct);
    }

    public async Task<List<Order>> GetRecentAsync(int count, CancellationToken ct = default) =>
        await Collection.Find(_ => true).SortByDescending(o => o.CreatedAt).Limit(count).ToListAsync(ct);

    private async Task<PagedResult<Order>> GetPagedAsync(FilterDefinition<Order> filter, int page, int pageSize, CancellationToken ct)
    {
        var total = await Collection.CountDocumentsAsync(filter, cancellationToken: ct);
        var items = await Collection.Find(filter)
            .SortByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(ct);
        return new PagedResult<Order> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }
}
