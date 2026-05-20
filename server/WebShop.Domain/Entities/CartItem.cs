namespace WebShop.Domain.Entities;

public class CartItem
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
