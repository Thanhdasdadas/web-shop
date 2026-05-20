using System.Security.Claims;
using WebShop.Domain.Enums;

namespace WebShop.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetUserId(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();

    public static UserRole GetUserRole(this ClaimsPrincipal user)
    {
        var role = user.FindFirstValue(ClaimTypes.Role) ?? "Customer";
        return Enum.Parse<UserRole>(role);
    }
}
