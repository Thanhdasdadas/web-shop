namespace WebShop.Application.Interfaces;

public interface IPasswordHasher
{
    string Hash(string password);
    (string Hash, string Salt) HashWithNewSalt(string password);
    bool Verify(string password, string hash, string salt);
    bool Verify(string password, string hash);
}
