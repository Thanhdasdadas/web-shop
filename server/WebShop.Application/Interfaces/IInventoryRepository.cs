using WebShop.Domain.Entities;

namespace WebShop.Application.Interfaces;

public interface IInventoryRepository : IRepository<Inventory>
{
    Task<Inventory?> GetByProductIdAsync(string productId, CancellationToken ct = default);
    Task<bool> DecrementStockAsync(string productId, int quantity, CancellationToken ct = default);
}
