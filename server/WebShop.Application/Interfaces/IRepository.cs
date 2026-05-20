using System.Linq.Expressions;
using WebShop.Domain.Entities;

namespace WebShop.Application.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<List<T>> GetAllAsync(CancellationToken ct = default);
    Task<List<T>> FindAsync(Expression<Func<T, bool>> filter, CancellationToken ct = default);
    Task<T> InsertAsync(T entity, CancellationToken ct = default);
    Task UpdateAsync(T entity, CancellationToken ct = default);
    Task DeleteAsync(string id, CancellationToken ct = default);
    Task<long> CountAsync(Expression<Func<T, bool>>? filter = null, CancellationToken ct = default);
}
