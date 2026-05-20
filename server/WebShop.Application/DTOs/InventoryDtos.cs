namespace WebShop.Application.DTOs;

public record InventoryDto(string ProductId, string ProductName, string Sku, int QuantityOnHand, int LowStockThreshold, bool IsLowStock);
public record AdjustInventoryRequest(string ProductId, int Delta, string Reason);
public record InventoryLogDto(string Id, string ProductId, string ProductName, int Delta, string Reason, string? ActorName, DateTime CreatedAt);
