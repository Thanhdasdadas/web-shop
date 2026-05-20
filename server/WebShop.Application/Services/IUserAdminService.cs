using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Domain.Enums;

namespace WebShop.Application.Services;

public interface IUserAdminService
{
    Task<UserAdminSummaryDto> GetSummaryAsync(CancellationToken ct = default);
    Task<PagedResult<AdminUserDto>> GetUsersAsync(UserRole? role, string? search, bool? isActive, int page, int pageSize, CancellationToken ct = default);
    Task<AdminUserDto> CreateAsync(CreateAdminUserRequest request, CancellationToken ct = default);
    Task<AdminUserDto> UpdateAsync(string id, UpdateAdminUserRequest request, string actorId, CancellationToken ct = default);
    Task<AdminUserDto> UpdateRoleAsync(string id, UpdateUserRoleRequest request, string actorId, CancellationToken ct = default);
    Task<AdminUserDto> UpdateActiveAsync(string id, UpdateUserActiveRequest request, string actorId, CancellationToken ct = default);
    Task ResetPasswordAsync(string id, ResetPasswordRequest request, CancellationToken ct = default);
}
