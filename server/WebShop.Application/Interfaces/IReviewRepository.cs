using WebShop.Application.Common;
using WebShop.Domain.Entities;

namespace WebShop.Application.Interfaces;

public interface IReviewRepository : IRepository<Review>
{
    Task<PagedResult<Review>> GetByProductIdAsync(string productId, bool approvedOnly, int page, int pageSize, CancellationToken ct = default);
    Task<Review?> GetByUserAndProductAsync(string userId, string productId, CancellationToken ct = default);
    Task<PagedResult<Review>> GetPagedAdminAsync(bool? approved, int page, int pageSize, CancellationToken ct = default);
    Task<double> GetAverageRatingAsync(string productId, CancellationToken ct = default);
}
