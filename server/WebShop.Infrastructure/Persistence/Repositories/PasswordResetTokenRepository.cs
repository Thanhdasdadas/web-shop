using MongoDB.Driver;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class PasswordResetTokenRepository(MongoDbContext context) : MongoRepository<PasswordResetToken>(context), IPasswordResetTokenRepository
{
    public async Task<PasswordResetToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default) =>
        await Collection.Find(t => t.TokenHash == tokenHash).FirstOrDefaultAsync(ct);
}
