using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Bson.Serialization.Conventions;
using WebShop.Domain.Entities;
using WebShop.Domain.Enums;
using WebShop.Infrastructure.Auth;

var pack = new ConventionPack
{
    new CamelCaseElementNameConvention(),
    new IgnoreExtraElementsConvention(true),
};
ConventionRegistry.Register("WebShopCamelCase", pack, _ => true);

LoadDotEnv(FindEnvFile());

const string connectionString = "mongodb://localhost:27017";
const string databaseName = "webshop";

var adminEmail = Environment.GetEnvironmentVariable("BOOTSTRAP_ADMIN_EMAIL")?.Trim().ToLowerInvariant()
    ?? "admin@glowbeauty.vn";
var newPassword = Environment.GetEnvironmentVariable("BOOTSTRAP_ADMIN_PASSWORD")
    ?? "Admin@123";

var usersBson = new MongoClient(connectionString).GetDatabase(databaseName).GetCollection<BsonDocument>("users");
var users = new MongoClient(connectionString).GetDatabase(databaseName).GetCollection<User>("users");
var hasher = new PasswordHasher();
var (hash, salt) = hasher.HashWithNewSalt(newPassword);

var emailFilter = Builders<BsonDocument>.Filter.Or(
    Builders<BsonDocument>.Filter.Eq("email", adminEmail),
    Builders<BsonDocument>.Filter.Eq("Email", adminEmail));

await usersBson.DeleteManyAsync(emailFilter);

await usersBson.InsertOneAsync(new BsonDocument
{
    { "_id", ObjectId.GenerateNewId().ToString() },
    { "email", adminEmail },
    { "passwordHash", hash },
    { "passwordSalt", salt },
    { "fullName", "Quản trị viên" },
    { "role", (int)UserRole.Admin },
    { "isActive", true },
    { "createdAt", DateTime.UtcNow },
    { "updatedAt", DateTime.UtcNow },
});

var user = await users.Find(u => u.Email == adminEmail).FirstOrDefaultAsync();
var ok = user != null && hasher.Verify(newPassword, user.PasswordHash, user.PasswordSalt);

Console.WriteLine($"Đọc user + verify mật khẩu: {(ok ? "OK" : "FAIL")}");
Console.WriteLine();
Console.WriteLine($"Email:    {adminEmail}");
Console.WriteLine("(Mật khẩu = BOOTSTRAP_ADMIN_PASSWORD trong file .env ở thư mục WebShop)");
Console.WriteLine();
Console.WriteLine("QUAN TRỌNG: Dừng API cũ (Ctrl+C) rồi chạy lại server/WebShop.Api");

static string? FindEnvFile()
{
    var dir = new DirectoryInfo(AppContext.BaseDirectory);
    while (dir is not null)
    {
        var candidate = Path.Combine(dir.FullName, ".env");
        if (File.Exists(candidate)) return candidate;
        dir = dir.Parent;
    }
    return null;
}

static void LoadDotEnv(string? path)
{
    if (path is null || !File.Exists(path)) return;
    foreach (var raw in File.ReadAllLines(path))
    {
        var line = raw.Trim();
        if (line.Length == 0 || line.StartsWith('#')) continue;
        var eq = line.IndexOf('=');
        if (eq <= 0) continue;
        var key = line[..eq].Trim();
        var value = line[(eq + 1)..].Trim();
        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
            Environment.SetEnvironmentVariable(key, value);
    }
}
