using System.Security.Cryptography;
using System.Text;
using WebShop.Application.Interfaces;

namespace WebShop.Infrastructure.Auth;

public class PasswordHasher : IPasswordHasher
{
    public (string Hash, string Salt) HashWithNewSalt(string password)
    {
        var saltBytes = RandomNumberGenerator.GetBytes(16);
        var salt = Convert.ToBase64String(saltBytes);
        var hash = ComputeHash(password, salt);
        return (hash, salt);
    }

    public string Hash(string password)
    {
        var (hash, _) = HashWithNewSalt(password);
        return hash;
    }

    public bool Verify(string password, string hash, string salt) =>
        CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(ComputeHash(password, salt)),
            Encoding.UTF8.GetBytes(hash));

    public bool Verify(string password, string hash) =>
        !string.IsNullOrEmpty(hash) && hash.StartsWith("$2", StringComparison.Ordinal) &&
        BCrypt.Net.BCrypt.Verify(password, hash);

    private static string ComputeHash(string password, string salt)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password + salt));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
