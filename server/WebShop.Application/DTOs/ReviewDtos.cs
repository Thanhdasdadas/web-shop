namespace WebShop.Application.DTOs;

public record ReviewDto(
    string Id, string ProductId, string UserId, string UserFullName,
    int Rating, string Comment, DateTime CreatedAt);

public record CreateReviewRequest(string ProductId, string OrderId, int Rating, string Comment);

public record ProductReviewSummaryDto(double AverageRating, int TotalCount, List<ReviewDto> Items);
