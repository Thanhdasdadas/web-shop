using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;
using WebShop.Domain.Enums;

namespace WebShop.Application.Services;

public class AuthService(
    IUserRepository users,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwt,
    IGoogleTokenValidator googleValidator) : IAuthService
{
    private const int RefreshTokenDaysShort = 1;
    private const int RefreshTokenDaysLong = 30;

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await users.GetByEmailAsync(request.Email.ToLowerInvariant(), ct) != null)
            throw new AppException("Email đã được sử dụng.");

        var (hash, salt) = passwordHasher.HashWithNewSalt(request.Password);
        var user = new User
        {
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = hash,
            PasswordSalt = salt,
            FullName = request.FullName,
            Phone = request.Phone,
            Role = UserRole.Customer
        };
        await users.InsertAsync(user, ct);
        return await CreateAuthResponseAsync(user, rememberMe: true, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await users.GetByEmailAsync(request.Email.ToLowerInvariant(), ct)
            ?? throw new AppException("Email hoặc mật khẩu không đúng.", 401);

        if (!user.IsActive)
            throw new AppException("Tài khoản đã bị khóa.", 403);

        if (string.IsNullOrEmpty(user.PasswordHash) && !string.IsNullOrEmpty(user.GoogleId))
            throw new AppException("Tài khoản này đăng nhập bằng Google. Vui lòng dùng nút Google.", 400);

        if (!VerifyPassword(request.Password, user))
            throw new AppException("Email hoặc mật khẩu không đúng.", 401);

        return await CreateAuthResponseAsync(user, request.RememberMe, ct);
    }

    public async Task<AuthResponse> GoogleLoginAsync(GoogleLoginRequest request, CancellationToken ct = default)
    {
        var info = await googleValidator.ValidateIdTokenAsync(request.IdToken, ct);

        var user = await users.GetByGoogleIdAsync(info.GoogleId, ct)
            ?? await users.GetByEmailAsync(info.Email, ct);

        if (user == null)
        {
            user = new User
            {
                Email = info.Email,
                FullName = info.FullName,
                GoogleId = info.GoogleId,
                AvatarUrl = info.Picture,
                PasswordHash = string.Empty,
                PasswordSalt = string.Empty,
                Role = UserRole.Customer
            };
            await users.InsertAsync(user, ct);
        }
        else
        {
            if (!user.IsActive)
                throw new AppException("Tài khoản đã bị khóa.", 403);

            var updated = false;
            if (string.IsNullOrEmpty(user.GoogleId))
            {
                user.GoogleId = info.GoogleId;
                updated = true;
            }
            if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(info.Picture))
            {
                user.AvatarUrl = info.Picture;
                updated = true;
            }
            if (updated)
            {
                user.UpdatedAt = DateTime.UtcNow;
                await users.UpdateAsync(user, ct);
            }
        }

        return await CreateAuthResponseAsync(user, request.RememberMe, ct);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken ct = default)
    {
        var hash = jwt.HashRefreshToken(request.RefreshToken);
        var stored = await refreshTokens.GetByTokenHashAsync(hash, ct)
            ?? throw new AppException("Refresh token không hợp lệ.", 401);

        if (stored.IsRevoked || stored.ExpiresAt < DateTime.UtcNow)
            throw new AppException("Refresh token đã hết hạn.", 401);

        var user = await users.GetByIdAsync(stored.UserId, ct)
            ?? throw new AppException("Người dùng không tồn tại.", 401);

        if (!user.IsActive)
            throw new AppException("Tài khoản đã bị khóa.", 403);

        stored.IsRevoked = true;
        await refreshTokens.UpdateAsync(stored, ct);

        return await CreateAuthResponseAsync(user, stored.RememberMe, ct);
    }

    public async Task<UserDto> UpdateProfileAsync(string userId, UpdateProfileRequest request, CancellationToken ct = default)
    {
        var user = await users.GetByIdAsync(userId, ct) ?? throw new AppException("Người dùng không tồn tại.");
        user.FullName = request.FullName.Trim();
        user.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        user.UpdatedAt = DateTime.UtcNow;
        await users.UpdateAsync(user, ct);
        return MapUser(user);
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await users.GetByIdAsync(userId, ct) ?? throw new AppException("Người dùng không tồn tại.");
        if (!string.IsNullOrEmpty(user.GoogleId) && string.IsNullOrEmpty(user.PasswordHash))
            throw new AppException("Tài khoản Google không đổi mật khẩu tại đây.", 400);

        if (!VerifyPassword(request.CurrentPassword, user))
            throw new AppException("Mật khẩu hiện tại không đúng.", 400);

        var (hash, salt) = passwordHasher.HashWithNewSalt(request.NewPassword);
        user.PasswordHash = hash;
        user.PasswordSalt = salt;
        user.UpdatedAt = DateTime.UtcNow;
        await users.UpdateAsync(user, ct);
    }

    public async Task LogoutAsync(string userId, string refreshToken, CancellationToken ct = default)
    {
        var hash = jwt.HashRefreshToken(refreshToken);
        var stored = await refreshTokens.GetByTokenHashAsync(hash, ct);
        if (stored != null && stored.UserId == userId)
        {
            stored.IsRevoked = true;
            await refreshTokens.UpdateAsync(stored, ct);
        }
    }

    private async Task<AuthResponse> CreateAuthResponseAsync(User user, bool rememberMe, CancellationToken ct)
    {
        var accessToken = jwt.GenerateAccessToken(user);
        var refreshToken = jwt.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(30);
        var refreshDays = rememberMe ? RefreshTokenDaysLong : RefreshTokenDaysShort;

        await refreshTokens.InsertAsync(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = jwt.HashRefreshToken(refreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(refreshDays),
            RememberMe = rememberMe
        }, ct);

        return new AuthResponse(accessToken, refreshToken, expiresAt, MapUser(user));
    }

    private bool VerifyPassword(string password, User user) =>
        !string.IsNullOrEmpty(user.PasswordSalt)
            ? passwordHasher.Verify(password, user.PasswordHash, user.PasswordSalt)
            : !string.IsNullOrEmpty(user.PasswordHash) && passwordHasher.Verify(password, user.PasswordHash);

    public static UserDto MapUser(User u) => new(u.Id, u.Email, u.FullName, u.Phone, u.Role);
}
