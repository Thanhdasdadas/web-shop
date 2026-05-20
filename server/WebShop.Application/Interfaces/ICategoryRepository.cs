using WebShop.Domain.Entities;

namespace WebShop.Application.Interfaces;

public interface ICategoryRepository : IRepository<Category>
{
    Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default);
}
