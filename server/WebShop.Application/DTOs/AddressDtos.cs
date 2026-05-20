namespace WebShop.Application.DTOs;

public record SavedAddressDto(
    string Id, string Label, string FullName, string Phone, string AddressLine,
    string Ward, string District, string City, bool IsDefault);

public record CreateSavedAddressRequest(
    string Label, string FullName, string Phone, string AddressLine,
    string Ward, string District, string City, bool IsDefault);

public record UpdateSavedAddressRequest(
    string Label, string FullName, string Phone, string AddressLine,
    string Ward, string District, string City, bool IsDefault);
