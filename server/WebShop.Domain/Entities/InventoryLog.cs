namespace WebShop.Domain.Entities;

[BsonCollection("inventoryLogs")]
public class InventoryLog : BaseEntity
{
    public string ProductId { get; set; } = string.Empty;
    public int Delta { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? ActorId { get; set; }
}
