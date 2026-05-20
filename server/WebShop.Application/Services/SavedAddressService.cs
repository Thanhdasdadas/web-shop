using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;

namespace WebShop.Application.Services;

public interface ISavedAddressService
{
    Task<List<SavedAddressDto>> GetMyAddressesAsync(string userId, CancellationToken ct = default);
    Task<SavedAddressDto> CreateAsync(string userId, CreateSavedAddressRequest request, CancellationToken ct = default);
    Task<SavedAddressDto> UpdateAsync(string userId, string id, UpdateSavedAddressRequest request, CancellationToken ct = default);
    Task DeleteAsync(string userId, string id, CancellationToken ct = default);
    Task<ShippingAddressDto> ResolveForCheckoutAsync(string userId, string? savedAddressId, ShippingAddressDto inline, CancellationToken ct = default);
}

public class SavedAddressService(ISavedAddressRepository addresses) : ISavedAddressService
{
    public async Task<List<SavedAddressDto>> GetMyAddressesAsync(string userId, CancellationToken ct = default)
    {
        var list = await addresses.GetByUserIdAsync(userId, ct);
        return list.Select(Map).ToList();
    }

    public async Task<SavedAddressDto> CreateAsync(string userId, CreateSavedAddressRequest request, CancellationToken ct = default)
    {
        if (request.IsDefault)
            await ClearDefaultAsync(userId, ct);

        var addr = new SavedAddress
        {
            UserId = userId,
            Label = request.Label,
            FullName = request.FullName,
            Phone = request.Phone,
            AddressLine = request.AddressLine,
            Ward = request.Ward ?? string.Empty,
            District = request.District,
            City = request.City,
            IsDefault = request.IsDefault
        };
        await addresses.InsertAsync(addr, ct);
        return Map(addr);
    }

    public async Task<SavedAddressDto> UpdateAsync(string userId, string id, UpdateSavedAddressRequest request, CancellationToken ct = default)
    {
        var addr = await GetOwnedAsync(userId, id, ct);
        if (request.IsDefault)
            await ClearDefaultAsync(userId, ct);

        addr.Label = request.Label;
        addr.FullName = request.FullName;
        addr.Phone = request.Phone;
        addr.AddressLine = request.AddressLine;
        addr.Ward = request.Ward ?? string.Empty;
        addr.District = request.District;
        addr.City = request.City;
        addr.IsDefault = request.IsDefault;
        addr.UpdatedAt = DateTime.UtcNow;
        await addresses.UpdateAsync(addr, ct);
        return Map(addr);
    }

    public async Task DeleteAsync(string userId, string id, CancellationToken ct = default)
    {
        var addr = await GetOwnedAsync(userId, id, ct);
        await addresses.DeleteAsync(addr.Id, ct);
    }

    public async Task<ShippingAddressDto> ResolveForCheckoutAsync(
        string userId, string? savedAddressId, ShippingAddressDto inline, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(savedAddressId))
            return inline;

        var addr = await GetOwnedAsync(userId, savedAddressId, ct);
        return new ShippingAddressDto(addr.FullName, addr.Phone, addr.AddressLine, addr.Ward, addr.District, addr.City);
    }

    private async Task<SavedAddress> GetOwnedAsync(string userId, string id, CancellationToken ct)
    {
        var addr = await addresses.GetByIdAsync(id, ct) ?? throw new AppException("Địa chỉ không tồn tại.");
        if (addr.UserId != userId) throw new AppException("Không có quyền.", 403);
        return addr;
    }

    private async Task ClearDefaultAsync(string userId, CancellationToken ct)
    {
        var all = await addresses.GetByUserIdAsync(userId, ct);
        foreach (var a in all.Where(x => x.IsDefault))
        {
            a.IsDefault = false;
            a.UpdatedAt = DateTime.UtcNow;
            await addresses.UpdateAsync(a, ct);
        }
    }

    private static SavedAddressDto Map(SavedAddress a) => new(
        a.Id, a.Label, a.FullName, a.Phone, a.AddressLine, a.Ward, a.District, a.City, a.IsDefault);
}
