using WebShop.Domain.Entities;

namespace WebShop.Application.Interfaces;

public interface ICartRepository : IRepository<Cart>
{
    Task<Cart?> GetByUserIdAsync(string userId, CancellationToken ct = default);
    Task<Cart?> GetBySessionIdAsync(string sessionId, CancellationToken ct = default);
}
