using WebShop.Domain.Entities;

namespace WebShop.Application.Interfaces;

public interface ISavedAddressRepository : IRepository<SavedAddress>
{
    Task<List<SavedAddress>> GetByUserIdAsync(string userId, CancellationToken ct = default);
}
