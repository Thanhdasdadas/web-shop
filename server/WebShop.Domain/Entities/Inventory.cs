namespace WebShop.Domain.Entities;

[BsonCollection("inventory")]
public class Inventory : BaseEntity
{
    public string ProductId { get; set; } = string.Empty;
    public int QuantityOnHand { get; set; }
    public int LowStockThreshold { get; set; } = 5;
}
