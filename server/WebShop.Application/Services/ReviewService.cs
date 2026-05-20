using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Application.Services;

public interface IReviewService
{
    Task<ProductReviewSummaryDto> GetProductReviewsAsync(string productId, int page, int pageSize, CancellationToken ct = default);
    Task<ReviewDto> CreateAsync(string userId, string userFullName, CreateReviewRequest request, CancellationToken ct = default);
    Task<PagedResult<ReviewDto>> GetAdminReviewsAsync(bool? approved, int page, int pageSize, CancellationToken ct = default);
    Task ApproveAsync(string id, CancellationToken ct = default);
    Task DeleteAsync(string id, CancellationToken ct = default);
}

public class ReviewService(
    IReviewRepository reviews,
    IOrderRepository orders,
    IProductRepository products) : IReviewService
{
    public async Task<ProductReviewSummaryDto> GetProductReviewsAsync(string productId, int page, int pageSize, CancellationToken ct = default)
    {
        var paged = await reviews.GetByProductIdAsync(productId, approvedOnly: true, page, pageSize, ct);
        var avg = await reviews.GetAverageRatingAsync(productId, ct);
        var total = await reviews.GetByProductIdAsync(productId, true, 1, 1, ct);
        return new ProductReviewSummaryDto(avg, (int)total.TotalCount, paged.Items.Select(Map).ToList());
    }

    public async Task<ReviewDto> CreateAsync(string userId, string userFullName, CreateReviewRequest request, CancellationToken ct = default)
    {
        _ = await products.GetByIdAsync(request.ProductId, ct) ?? throw new AppException("Sản phẩm không tồn tại.");

        if (await reviews.GetByUserAndProductAsync(userId, request.ProductId, ct) != null)
            throw new AppException("Bạn đã đánh giá sản phẩm này.");

        if (!await orders.UserHasDeliveredProductAsync(userId, request.ProductId, ct))
            throw new AppException("Chỉ đánh giá sau khi đã nhận hàng thành công.");

        var review = new Review
        {
            ProductId = request.ProductId,
            UserId = userId,
            UserFullName = userFullName,
            OrderId = request.OrderId,
            Rating = request.Rating,
            Comment = request.Comment.Trim(),
            IsApproved = true
        };
        await reviews.InsertAsync(review, ct);
        return Map(review);
    }

    public async Task<PagedResult<ReviewDto>> GetAdminReviewsAsync(bool? approved, int page, int pageSize, CancellationToken ct = default)
    {
        var paged = await reviews.GetPagedAdminAsync(approved, page, pageSize, ct);
        return new PagedResult<ReviewDto>
        {
            Items = paged.Items.Select(Map).ToList(),
            Page = paged.Page,
            PageSize = paged.PageSize,
            TotalCount = paged.TotalCount
        };
    }

    public async Task ApproveAsync(string id, CancellationToken ct = default)
    {
        var r = await reviews.GetByIdAsync(id, ct) ?? throw new AppException("Đánh giá không tồn tại.");
        r.IsApproved = true;
        r.UpdatedAt = DateTime.UtcNow;
        await reviews.UpdateAsync(r, ct);
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default) =>
        await reviews.DeleteAsync(id, ct);

    private static ReviewDto Map(Review r) => new(r.Id, r.ProductId, r.UserId, r.UserFullName, r.Rating, r.Comment, r.CreatedAt);
}
