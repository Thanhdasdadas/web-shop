namespace WebShop.Domain.Entities;

[BsonCollection("carts")]
public class Cart : BaseEntity
{
    public string? UserId { get; set; }
    public string? SessionId { get; set; }
    public List<CartItem> Items { get; set; } = [];
}
