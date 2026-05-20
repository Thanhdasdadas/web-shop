using MongoDB.Driver;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Infrastructure.Persistence.Repositories;

public class CouponRepository(MongoDbContext context) : MongoRepository<Coupon>(context), ICouponRepository
{
    public async Task<Coupon?> GetByCodeAsync(string code, CancellationToken ct = default) =>
        await Collection.Find(c => c.Code == code.ToUpperInvariant()).FirstOrDefaultAsync(ct);
}
