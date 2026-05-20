namespace WebShop.Application.Interfaces;

public record GoogleUserInfo(string GoogleId, string Email, string FullName, string? Picture);

public interface IGoogleTokenValidator
{
    Task<GoogleUserInfo> ValidateIdTokenAsync(string idToken, CancellationToken ct = default);
}
