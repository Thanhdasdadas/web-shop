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
    IJwtTokenService jwt) : IAuthService
{
    private const int RefreshTokenDays = 7;

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
        return await CreateAuthResponseAsync(user, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await users.GetByEmailAsync(request.Email.ToLowerInvariant(), ct)
            ?? throw new AppException("Email hoặc mật khẩu không đúng.", 401);

        if (!user.IsActive)
            throw new AppException("Tài khoản đã bị khóa.", 403);

        if (!VerifyPassword(request.Password, user))
            throw new AppException("Email hoặc mật khẩu không đúng.", 401);

        return await CreateAuthResponseAsync(user, ct);
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

        return await CreateAuthResponseAsync(user, ct);
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

    private async Task<AuthResponse> CreateAuthResponseAsync(User user, CancellationToken ct)
    {
        var accessToken = jwt.GenerateAccessToken(user);
        var refreshToken = jwt.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(30);

        await refreshTokens.InsertAsync(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = jwt.HashRefreshToken(refreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(RefreshTokenDays)
        }, ct);

        return new AuthResponse(accessToken, refreshToken, expiresAt, MapUser(user));
    }

    private bool VerifyPassword(string password, User user) =>
        !string.IsNullOrEmpty(user.PasswordSalt)
            ? passwordHasher.Verify(password, user.PasswordHash, user.PasswordSalt)
            : passwordHasher.Verify(password, user.PasswordHash);

    public static UserDto MapUser(User u) => new(u.Id, u.Email, u.FullName, u.Phone, u.Role);
}
