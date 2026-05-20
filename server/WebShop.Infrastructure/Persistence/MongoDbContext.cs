using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using WebShop.Domain.Entities;
using WebShop.Infrastructure.Settings;

namespace WebShop.Infrastructure.Persistence;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
    }

    public IMongoCollection<T> GetCollection<T>() where T : BaseEntity
    {
        var name = GetCollectionName<T>();
        return _database.GetCollection<T>(name);
    }

    public async Task<long> DeleteAllAsync<T>(CancellationToken ct = default) where T : BaseEntity
    {
        var result = await GetCollection<T>().DeleteManyAsync(FilterDefinition<T>.Empty, ct);
        return result.DeletedCount;
    }

    private static string GetCollectionName<T>()
    {
        var attr = typeof(T).GetCustomAttributes(typeof(BsonCollectionAttribute), true).FirstOrDefault() as BsonCollectionAttribute;
        return attr?.CollectionName ?? typeof(T).Name.ToLowerInvariant();
    }
}
