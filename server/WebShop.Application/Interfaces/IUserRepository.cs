using WebShop.Application.Common;
using WebShop.Domain.Entities;
using WebShop.Domain.Enums;

namespace WebShop.Application.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> AnyAdminExistsAsync(CancellationToken ct = default);
    Task<long> CountByRoleAsync(UserRole? role, bool? isActive, CancellationToken ct = default);
    Task<PagedResult<User>> GetPagedAsync(UserRole? role, string? search, bool? isActive, int page, int pageSize, CancellationToken ct = default);
}
