using MongoDB.Driver;
using WebShop.Application.Common;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class ReviewRepository(MongoDbContext context) : MongoRepository<Review>(context), IReviewRepository
{
    public async Task<PagedResult<Review>> GetByProductIdAsync(string productId, bool approvedOnly, int page, int pageSize, CancellationToken ct = default)
    {
        var filter = Builders<Review>.Filter.Eq(r => r.ProductId, productId);
        if (approvedOnly) filter &= Builders<Review>.Filter.Eq(r => r.IsApproved, true);
        return await PageAsync(filter, page, pageSize, ct);
    }

    public async Task<Review?> GetByUserAndProductAsync(string userId, string productId, CancellationToken ct = default) =>
        await Collection.Find(r => r.UserId == userId && r.ProductId == productId).FirstOrDefaultAsync(ct);

    public async Task<PagedResult<Review>> GetPagedAdminAsync(bool? approved, int page, int pageSize, CancellationToken ct = default)
    {
        var filter = Builders<Review>.Filter.Empty;
        if (approved.HasValue) filter = Builders<Review>.Filter.Eq(r => r.IsApproved, approved.Value);
        return await PageAsync(filter, page, pageSize, ct);
    }

    public async Task<double> GetAverageRatingAsync(string productId, CancellationToken ct = default)
    {
        var reviews = await Collection.Find(r => r.ProductId == productId && r.IsApproved).ToListAsync(ct);
        return reviews.Count == 0 ? 0 : reviews.Average(r => r.Rating);
    }

    private async Task<PagedResult<Review>> PageAsync(FilterDefinition<Review> filter, int page, int pageSize, CancellationToken ct)
    {
        var total = await Collection.CountDocumentsAsync(filter, cancellationToken: ct);
        var items = await Collection.Find(filter).SortByDescending(r => r.CreatedAt).Skip((page - 1) * pageSize).Limit(pageSize).ToListAsync(ct);
        return new PagedResult<Review> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }
}
