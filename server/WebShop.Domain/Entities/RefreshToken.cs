namespace WebShop.Domain.Entities;

[BsonCollection("refreshTokens")]
public class RefreshToken : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public bool RememberMe { get; set; }
}
