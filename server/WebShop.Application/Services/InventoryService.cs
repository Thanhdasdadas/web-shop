using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Application.Services;

public class InventoryService(
    IInventoryRepository inventory,
    IRepository<InventoryLog> logs,
    IProductRepository products,
    IUserRepository users) : IInventoryService
{
    public async Task<List<InventoryDto>> GetAllAsync(CancellationToken ct = default)
    {
        var all = await inventory.GetAllAsync(ct);
        var result = new List<InventoryDto>();
        foreach (var inv in all)
        {
            var product = await products.GetByIdAsync(inv.ProductId, ct);
            if (product == null) continue;
            result.Add(new InventoryDto(inv.ProductId, product.Name, product.Sku, inv.QuantityOnHand, inv.LowStockThreshold,
                inv.QuantityOnHand <= inv.LowStockThreshold));
        }
        return result;
    }

    public async Task<InventoryDto> AdjustAsync(string actorId, AdjustInventoryRequest request, CancellationToken ct = default)
    {
        var inv = await inventory.GetByProductIdAsync(request.ProductId, ct)
            ?? throw new AppException("Kho không tồn tại cho sản phẩm này.");

        var newQty = inv.QuantityOnHand + request.Delta;
        if (newQty < 0) throw new AppException("Số lượng tồn kho không đủ để trừ.");

        inv.QuantityOnHand = newQty;
        inv.UpdatedAt = DateTime.UtcNow;
        await inventory.UpdateAsync(inv, ct);

        await logs.InsertAsync(new InventoryLog
        {
            ProductId = request.ProductId,
            Delta = request.Delta,
            Reason = request.Reason,
            ActorId = actorId
        }, ct);

        var product = await products.GetByIdAsync(request.ProductId, ct);
        return new InventoryDto(inv.ProductId, product!.Name, product.Sku, inv.QuantityOnHand, inv.LowStockThreshold,
            inv.QuantityOnHand <= inv.LowStockThreshold);
    }

    public async Task<List<InventoryLogDto>> GetLogsAsync(int limit, CancellationToken ct = default)
    {
        var all = await logs.GetAllAsync(ct);
        var result = new List<InventoryLogDto>();
        foreach (var log in all.OrderByDescending(l => l.CreatedAt).Take(limit))
        {
            var product = await products.GetByIdAsync(log.ProductId, ct);
            string? actorName = null;
            if (!string.IsNullOrEmpty(log.ActorId))
            {
                var actor = await users.GetByIdAsync(log.ActorId, ct);
                actorName = actor?.FullName;
            }
            result.Add(new InventoryLogDto(log.Id, log.ProductId, product?.Name ?? "?", log.Delta, log.Reason, actorName, log.CreatedAt));
        }
        return result;
    }
}
