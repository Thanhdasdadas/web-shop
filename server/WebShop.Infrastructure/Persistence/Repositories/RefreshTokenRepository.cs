using MongoDB.Driver;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class RefreshTokenRepository(MongoDbContext context) : MongoRepository<RefreshToken>(context), IRefreshTokenRepository
{
    public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default) =>
        await Collection.Find(t => t.TokenHash == tokenHash && !t.IsRevoked).FirstOrDefaultAsync(ct);

    public async Task RevokeAllForUserAsync(string userId, CancellationToken ct = default) =>
        await Collection.UpdateManyAsync(t => t.UserId == userId, Builders<RefreshToken>.Update.Set(t => t.IsRevoked, true), cancellationToken: ct);
}
