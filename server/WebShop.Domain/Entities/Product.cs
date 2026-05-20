namespace WebShop.Domain.Entities;

[BsonCollection("products")]
public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Images { get; set; } = [];
    public decimal Price { get; set; }
    public string CategoryId { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
}
