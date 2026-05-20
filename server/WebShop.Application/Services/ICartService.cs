using WebShop.Application.DTOs;

namespace WebShop.Application.Services;

public interface ICartService
{
    Task<CartDto> GetCartAsync(string? userId, string? sessionId, CancellationToken ct = default);
    Task<CartDto> AddItemAsync(string? userId, string? sessionId, AddToCartRequest request, CancellationToken ct = default);
    Task<CartDto> UpdateItemAsync(string? userId, string? sessionId, string productId, UpdateCartItemRequest request, CancellationToken ct = default);
    Task<CartDto> RemoveItemAsync(string? userId, string? sessionId, string productId, CancellationToken ct = default);
    Task MergeSessionCartAsync(string userId, string sessionId, CancellationToken ct = default);
}
