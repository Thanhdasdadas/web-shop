using WebShop.Domain.Enums;

namespace WebShop.Domain.Entities;

[BsonCollection("orderStatusHistory")]
public class OrderStatusHistory : BaseEntity
{
    public string OrderId { get; set; } = string.Empty;
    public OrderStatus? FromStatus { get; set; }
    public OrderStatus ToStatus { get; set; }
    public string? Note { get; set; }
    public string ChangedBy { get; set; } = string.Empty;
}
