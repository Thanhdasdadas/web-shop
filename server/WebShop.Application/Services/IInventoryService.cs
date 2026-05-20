using WebShop.Application.DTOs;

namespace WebShop.Application.Services;

public interface IInventoryService
{
    Task<List<InventoryDto>> GetAllAsync(CancellationToken ct = default);
    Task<InventoryDto> AdjustAsync(string actorId, AdjustInventoryRequest request, CancellationToken ct = default);
    Task<List<InventoryLogDto>> GetLogsAsync(int limit, CancellationToken ct = default);
}
