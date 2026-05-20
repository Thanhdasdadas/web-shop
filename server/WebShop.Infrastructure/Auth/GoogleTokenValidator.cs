using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using WebShop.Application.Common;
using WebShop.Application.Interfaces;
using WebShop.Infrastructure.Settings;

namespace WebShop.Infrastructure.Auth;

public class GoogleTokenValidator(IOptions<GoogleSettings> options) : IGoogleTokenValidator
{
    public async Task<GoogleUserInfo> ValidateIdTokenAsync(string idToken, CancellationToken ct = default)
    {
        var clientId = options.Value.ClientId;
        if (string.IsNullOrWhiteSpace(clientId))
            clientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") ?? "";

        if (string.IsNullOrWhiteSpace(clientId))
            throw new AppException("Google Sign-In chưa được cấu hình (GOOGLE_CLIENT_ID).", 503);

        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [clientId]
            });

            if (string.IsNullOrEmpty(payload.Subject) || string.IsNullOrEmpty(payload.Email))
                throw new AppException("Token Google không hợp lệ.", 401);

            if (payload.EmailVerified != true)
                throw new AppException("Email Google chưa được xác minh.", 401);

            var name = string.IsNullOrWhiteSpace(payload.Name) ? payload.Email.Split('@')[0] : payload.Name;
            return new GoogleUserInfo(payload.Subject, payload.Email.ToLowerInvariant(), name, payload.Picture);
        }
        catch (InvalidJwtException)
        {
            throw new AppException("Token Google không hợp lệ hoặc đã hết hạn.", 401);
        }
    }
}
