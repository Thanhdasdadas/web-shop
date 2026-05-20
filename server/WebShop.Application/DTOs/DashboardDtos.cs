using WebShop.Domain.Enums;

namespace WebShop.Application.DTOs;

public record DashboardSummaryDto(
    decimal TotalRevenue,
    long TotalOrders,
    Dictionary<string, long> OrdersByStatus,
    List<LowStockProductDto> LowStockProducts,
    List<OrderDto> RecentOrders);

public record LowStockProductDto(string ProductId, string ProductName, int QuantityOnHand, int LowStockThreshold);

public record AdminUserDto(string Id, string Email, string FullName, string? Phone, UserRole Role, bool IsActive, DateTime CreatedAt);
public record UserAdminSummaryDto(long Total, long Customers, long Staff, long Admins, long Inactive);
public record CreateAdminUserRequest(string Email, string Password, string FullName, string? Phone, UserRole Role);
public record UpdateAdminUserRequest(string FullName, string? Phone, UserRole Role);
public record ResetPasswordRequest(string NewPassword);
public record UpdateUserRoleRequest(UserRole Role);
public record UpdateUserActiveRequest(bool IsActive);

public record ProductAdminSummaryDto(long Total, long Published, long Unpublished, long LowStock);
public record SetPublishRequest(bool IsPublished);

public record OrderStatusHistoryDto(OrderStatus? FromStatus, OrderStatus ToStatus, string? Note, string ChangedBy, DateTime CreatedAt);
