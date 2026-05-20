using System.Linq.Expressions;
using MongoDB.Bson;
using MongoDB.Driver;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Infrastructure.Persistence;

public class MongoRepository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly IMongoCollection<T> Collection;

    public MongoRepository(MongoDbContext context) => Collection = context.GetCollection<T>();

    public async Task<T?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        if (!ObjectId.TryParse(id, out _)) return null;
        return await Collection.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<List<T>> GetAllAsync(CancellationToken ct = default) =>
        await Collection.Find(_ => true).ToListAsync(ct);

    public async Task<List<T>> FindAsync(Expression<Func<T, bool>> filter, CancellationToken ct = default) =>
        await Collection.Find(filter).ToListAsync(ct);

    public async Task<T> InsertAsync(T entity, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(entity.Id))
            entity.Id = ObjectId.GenerateNewId().ToString();
        entity.CreatedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        await Collection.InsertOneAsync(entity, cancellationToken: ct);
        return entity;
    }

    public async Task UpdateAsync(T entity, CancellationToken ct = default)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        await Collection.ReplaceOneAsync(x => x.Id == entity.Id, entity, cancellationToken: ct);
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default) =>
        await Collection.DeleteOneAsync(x => x.Id == id, ct);

    public async Task<long> CountAsync(Expression<Func<T, bool>>? filter = null, CancellationToken ct = default)
    {
        if (filter == null) return await Collection.CountDocumentsAsync(_ => true, cancellationToken: ct);
        return await Collection.CountDocumentsAsync(filter, cancellationToken: ct);
    }
}
