namespace WebShop.Domain.Entities;

[AttributeUsage(AttributeTargets.Class)]
public class BsonCollectionAttribute : Attribute
{
    public BsonCollectionAttribute(string collectionName) => CollectionName = collectionName;
    public string CollectionName { get; }
}
