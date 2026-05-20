namespace WebShop.Application.DTOs;

public record CartItemDto(string ProductId, string ProductName, string? Image, decimal Price, int Quantity, int StockAvailable);
public record CartDto(string Id, List<CartItemDto> Items, decimal Subtotal);
public record AddToCartRequest(string ProductId, int Quantity);
public record UpdateCartItemRequest(int Quantity);
