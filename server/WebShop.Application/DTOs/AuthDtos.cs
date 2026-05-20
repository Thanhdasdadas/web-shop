using WebShop.Domain.Enums;

namespace WebShop.Application.DTOs;

public record RegisterRequest(string Email, string Password, string FullName, string? Phone);
public record LoginRequest(string Email, string Password, bool RememberMe = false);
public record GoogleLoginRequest(string IdToken, bool RememberMe = false);
public record RefreshRequest(string RefreshToken);
public record AuthResponse(string AccessToken, string RefreshToken, DateTime ExpiresAt, UserDto User);
public record UserDto(string Id, string Email, string FullName, string? Phone, UserRole Role);
public record UpdateProfileRequest(string FullName, string? Phone);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record ForgotPasswordRequest(string Email);
public record ConfirmPasswordResetRequest(string Token, string NewPassword);
public record ForgotPasswordResponse(string Message, string? ResetToken);
