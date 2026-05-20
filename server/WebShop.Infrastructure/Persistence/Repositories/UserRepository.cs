using MongoDB.Driver;
using WebShop.Application.Common;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;
using WebShop.Domain.Enums;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class UserRepository(MongoDbContext context) : MongoRepository<User>(context), IUserRepository
{
    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        await Collection.Find(u => u.Email == email).FirstOrDefaultAsync(ct);

    public async Task<bool> AnyAdminExistsAsync(CancellationToken ct = default) =>
        await Collection.CountDocumentsAsync(u => u.Role == UserRole.Admin, cancellationToken: ct) > 0;

    public async Task<long> CountByRoleAsync(UserRole? role, bool? isActive, CancellationToken ct = default)
    {
        var filter = BuildFilter(role, null, isActive);
        return await Collection.CountDocumentsAsync(filter, cancellationToken: ct);
    }

    public async Task<PagedResult<User>> GetPagedAsync(UserRole? role, string? search, bool? isActive, int page, int pageSize, CancellationToken ct = default)
    {
        var filter = BuildFilter(role, search, isActive);
        var total = await Collection.CountDocumentsAsync(filter, cancellationToken: ct);
        var items = await Collection.Find(filter)
            .SortByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(ct);
        return new PagedResult<User> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }

    private static FilterDefinition<User> BuildFilter(UserRole? role, string? search, bool? isActive)
    {
        var builder = Builders<User>.Filter;
        var filter = builder.Empty;
        if (role.HasValue) filter &= builder.Eq(u => u.Role, role.Value);
        if (isActive.HasValue) filter &= builder.Eq(u => u.IsActive, isActive.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var regex = new MongoDB.Bson.BsonRegularExpression(search, "i");
            filter &= builder.Or(
                builder.Regex(u => u.Email, regex),
                builder.Regex(u => u.FullName, regex));
        }
        return filter;
    }
}
