namespace WebShop.Application.DTOs;

public record WishlistItemDto(string ProductId, string Name, string Slug, decimal Price, string? Image, int? Stock);
public record WishlistDto(List<WishlistItemDto> Items);
