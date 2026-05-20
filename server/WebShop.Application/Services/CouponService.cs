using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;
using WebShop.Domain.Enums;

namespace WebShop.Application.Services;

public interface ICouponService
{
    Task<List<CouponDto>> GetAllAsync(CancellationToken ct = default);
    Task<CouponDto> CreateAsync(CreateCouponRequest request, CancellationToken ct = default);
    Task<CouponDto> UpdateAsync(string id, UpdateCouponRequest request, CancellationToken ct = default);
    Task DeleteAsync(string id, CancellationToken ct = default);
    Task<ValidateCouponResponse> ValidateAsync(ValidateCouponRequest request, CancellationToken ct = default);
    Task<decimal> ApplyAndIncrementAsync(string code, decimal subtotal, CancellationToken ct = default);
}

public class CouponService(ICouponRepository coupons) : ICouponService
{
    public async Task<List<CouponDto>> GetAllAsync(CancellationToken ct = default)
    {
        var all = await coupons.GetAllAsync(ct);
        return all.Select(Map).ToList();
    }

    public async Task<CouponDto> CreateAsync(CreateCouponRequest request, CancellationToken ct = default)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        if (await coupons.GetByCodeAsync(code, ct) != null)
            throw new AppException("Mã giảm giá đã tồn tại.");

        var coupon = new Coupon
        {
            Code = code,
            DiscountType = request.DiscountType,
            Value = request.Value,
            MinOrderAmount = request.MinOrderAmount,
            MaxDiscount = request.MaxDiscount,
            ExpiresAt = request.ExpiresAt,
            UsageLimit = request.UsageLimit,
            IsActive = request.IsActive
        };
        await coupons.InsertAsync(coupon, ct);
        return Map(coupon);
    }

    public async Task<CouponDto> UpdateAsync(string id, UpdateCouponRequest request, CancellationToken ct = default)
    {
        var coupon = await coupons.GetByIdAsync(id, ct) ?? throw new AppException("Mã giảm giá không tồn tại.");
        coupon.DiscountType = request.DiscountType;
        coupon.Value = request.Value;
        coupon.MinOrderAmount = request.MinOrderAmount;
        coupon.MaxDiscount = request.MaxDiscount;
        coupon.ExpiresAt = request.ExpiresAt;
        coupon.UsageLimit = request.UsageLimit;
        coupon.IsActive = request.IsActive;
        coupon.UpdatedAt = DateTime.UtcNow;
        await coupons.UpdateAsync(coupon, ct);
        return Map(coupon);
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default) =>
        await coupons.DeleteAsync(id, ct);

    public async Task<ValidateCouponResponse> ValidateAsync(ValidateCouponRequest request, CancellationToken ct = default)
    {
        var coupon = await coupons.GetByCodeAsync(request.Code.Trim().ToUpperInvariant(), ct);
        return ValidateCouponInternal(request.Code, request.Subtotal, coupon);
    }

    public async Task<decimal> ApplyAndIncrementAsync(string code, decimal subtotal, CancellationToken ct = default)
    {
        var coupon = await coupons.GetByCodeAsync(code.Trim().ToUpperInvariant(), ct)
            ?? throw new AppException("Mã giảm giá không hợp lệ.");

        var result = ValidateCouponInternal(code, subtotal, coupon);
        if (!result.Valid)
            throw new AppException(result.Message ?? "Mã giảm giá không hợp lệ.");

        coupon.UsedCount++;
        coupon.UpdatedAt = DateTime.UtcNow;
        await coupons.UpdateAsync(coupon, ct);
        return result.DiscountAmount;
    }

    private static ValidateCouponResponse ValidateCouponInternal(string code, decimal subtotal, Coupon? coupon)
    {
        if (string.IsNullOrWhiteSpace(code))
            return new ValidateCouponResponse(false, "Nhập mã giảm giá.", 0, null);

        coupon ??= null; // loaded externally in Apply

        return coupon switch
        {
            null => new ValidateCouponResponse(false, "Mã không tồn tại.", 0, null),
            { IsActive: false } => new ValidateCouponResponse(false, "Mã đã bị vô hiệu.", 0, null),
            { ExpiresAt: not null } when coupon.ExpiresAt < DateTime.UtcNow =>
                new ValidateCouponResponse(false, "Mã đã hết hạn.", 0, null),
            { UsageLimit: not null } when coupon.UsedCount >= coupon.UsageLimit =>
                new ValidateCouponResponse(false, "Mã đã hết lượt dùng.", 0, null),
            _ when subtotal < coupon.MinOrderAmount =>
                new ValidateCouponResponse(false, $"Đơn tối thiểu {coupon.MinOrderAmount:N0}đ.", 0, null),
            _ => new ValidateCouponResponse(true, null, CalculateDiscount(coupon, subtotal), coupon.Code)
        };
    }

    public static decimal CalculateDiscount(Coupon coupon, decimal subtotal)
    {
        var discount = coupon.DiscountType switch
        {
            CouponDiscountType.Percent => subtotal * coupon.Value / 100m,
            _ => coupon.Value
        };
        if (coupon.MaxDiscount.HasValue && discount > coupon.MaxDiscount.Value)
            discount = coupon.MaxDiscount.Value;
        return Math.Min(discount, subtotal);
    }

    private static CouponDto Map(Coupon c) => new(
        c.Id, c.Code, c.DiscountType, c.Value, c.MinOrderAmount, c.MaxDiscount,
        c.ExpiresAt, c.UsageLimit, c.UsedCount, c.IsActive);
}
