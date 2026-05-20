using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;
using WebShop.Domain.Enums;

namespace WebShop.Application.Services;

public class UserAdminService(
    IUserRepository users,
    IPasswordHasher passwordHasher) : IUserAdminService
{
    public async Task<UserAdminSummaryDto> GetSummaryAsync(CancellationToken ct = default)
    {
        var total = await users.CountByRoleAsync(null, null, ct);
        var customers = await users.CountByRoleAsync(UserRole.Customer, null, ct);
        var staff = await users.CountByRoleAsync(UserRole.Staff, null, ct);
        var admins = await users.CountByRoleAsync(UserRole.Admin, null, ct);
        var inactive = await users.CountByRoleAsync(null, false, ct);
        return new UserAdminSummaryDto(total, customers, staff, admins, inactive);
    }

    public async Task<PagedResult<AdminUserDto>> GetUsersAsync(UserRole? role, string? search, bool? isActive, int page, int pageSize, CancellationToken ct = default)
    {
        var paged = await users.GetPagedAsync(role, search, isActive, page, pageSize, ct);
        return new PagedResult<AdminUserDto>
        {
            Items = paged.Items.Select(Map).ToList(),
            Page = paged.Page,
            PageSize = paged.PageSize,
            TotalCount = paged.TotalCount
        };
    }

    public async Task<AdminUserDto> CreateAsync(CreateAdminUserRequest request, CancellationToken ct = default)
    {
        var email = request.Email.ToLowerInvariant();
        if (await users.GetByEmailAsync(email, ct) != null)
            throw new AppException("Email đã được sử dụng.");

        var (hash, salt) = passwordHasher.HashWithNewSalt(request.Password);
        var user = new User
        {
            Email = email,
            PasswordHash = hash,
            PasswordSalt = salt,
            FullName = request.FullName,
            Phone = request.Phone,
            Role = request.Role,
            IsActive = true
        };
        await users.InsertAsync(user, ct);
        return Map(user);
    }

    public async Task<AdminUserDto> UpdateAsync(string id, UpdateAdminUserRequest request, string actorId, CancellationToken ct = default)
    {
        var user = await GetUserOrThrow(id, ct);
        await EnsureCanModify(actorId, user, request.Role, ct);
        user.FullName = request.FullName;
        user.Phone = request.Phone;
        user.Role = request.Role;
        user.UpdatedAt = DateTime.UtcNow;
        await users.UpdateAsync(user, ct);
        return Map(user);
    }

    public async Task<AdminUserDto> UpdateRoleAsync(string id, UpdateUserRoleRequest request, string actorId, CancellationToken ct = default)
    {
        var user = await GetUserOrThrow(id, ct);
        await EnsureCanModify(actorId, user, request.Role, ct);
        user.Role = request.Role;
        user.UpdatedAt = DateTime.UtcNow;
        await users.UpdateAsync(user, ct);
        return Map(user);
    }

    public async Task<AdminUserDto> UpdateActiveAsync(string id, UpdateUserActiveRequest request, string actorId, CancellationToken ct = default)
    {
        var user = await GetUserOrThrow(id, ct);
        if (id == actorId && !request.IsActive)
            throw new AppException("Không thể khóa tài khoản của chính bạn.");
        if (!request.IsActive && user.Role == UserRole.Admin)
            await EnsureNotLastAdmin(user.Id, ct);
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await users.UpdateAsync(user, ct);
        return Map(user);
    }

    public async Task ResetPasswordAsync(string id, ResetPasswordRequest request, CancellationToken ct = default)
    {
        var user = await GetUserOrThrow(id, ct);
        var (hash, salt) = passwordHasher.HashWithNewSalt(request.NewPassword);
        user.PasswordHash = hash;
        user.PasswordSalt = salt;
        user.UpdatedAt = DateTime.UtcNow;
        await users.UpdateAsync(user, ct);
    }

    private async Task<User> GetUserOrThrow(string id, CancellationToken ct) =>
        await users.GetByIdAsync(id, ct) ?? throw new AppException("Người dùng không tồn tại.");

    private async Task EnsureCanModify(string actorId, User target, UserRole newRole, CancellationToken ct)
    {
        if (target.Id == actorId && newRole != UserRole.Admin)
            throw new AppException("Không thể hạ quyền tài khoản đang đăng nhập.");
        if (target.Role == UserRole.Admin && newRole != UserRole.Admin)
            await EnsureNotLastAdmin(target.Id, ct);
    }

    private async Task EnsureNotLastAdmin(string excludeDeactivatingId, CancellationToken ct)
    {
        var adminCount = await users.CountByRoleAsync(UserRole.Admin, true, ct);
        var target = await users.GetByIdAsync(excludeDeactivatingId, ct);
        if (target?.Role == UserRole.Admin && adminCount <= 1)
            throw new AppException("Không thể thay đổi quyền Admin cuối cùng.");
    }

    private static AdminUserDto Map(User u) =>
        new(u.Id, u.Email, u.FullName, u.Phone, u.Role, u.IsActive, u.CreatedAt);
}
