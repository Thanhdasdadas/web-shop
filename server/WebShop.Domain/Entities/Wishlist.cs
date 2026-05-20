namespace WebShop.Domain.Entities;

[BsonCollection("wishlists")]
public class Wishlist : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public List<string> ProductIds { get; set; } = [];
}
