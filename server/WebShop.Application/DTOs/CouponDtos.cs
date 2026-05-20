using WebShop.Domain.Enums;

namespace WebShop.Application.DTOs;

public record CouponDto(
    string Id, string Code, CouponDiscountType DiscountType, decimal Value,
    decimal MinOrderAmount, decimal? MaxDiscount, DateTime? ExpiresAt,
    int? UsageLimit, int UsedCount, bool IsActive);

public record CreateCouponRequest(
    string Code, CouponDiscountType DiscountType, decimal Value,
    decimal MinOrderAmount, decimal? MaxDiscount, DateTime? ExpiresAt,
    int? UsageLimit, bool IsActive = true);

public record UpdateCouponRequest(
    CouponDiscountType DiscountType, decimal Value, decimal MinOrderAmount,
    decimal? MaxDiscount, DateTime? ExpiresAt, int? UsageLimit, bool IsActive);

public record ValidateCouponRequest(string Code, decimal Subtotal);
public record ValidateCouponResponse(bool Valid, string? Message, decimal DiscountAmount, string? Code);
