namespace WebShop.Infrastructure.Settings;

public class JwtSettings
{
    public const string SectionName = "Jwt";
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = "WebShop";
    public string Audience { get; set; } = "WebShop";
    public int AccessTokenMinutes { get; set; } = 30;
}
