namespace WebShop.Domain.Entities;

[BsonCollection("passwordResetTokens")]
public class PasswordResetToken : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
}
