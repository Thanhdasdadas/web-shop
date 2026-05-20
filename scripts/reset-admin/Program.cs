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

const string connectionString = "mongodb://localhost:27017";
const string databaseName = "webshop";
const string adminEmail = "admin@webshop.vn";
const string newPassword = "Admin@123";

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
    { "role", 2 },
    { "isActive", true },
    { "createdAt", DateTime.UtcNow },
    { "updatedAt", DateTime.UtcNow },
});

var user = await users.Find(u => u.Email == adminEmail).FirstOrDefaultAsync();
var ok = user != null && hasher.Verify(newPassword, user.PasswordHash, user.PasswordSalt);

Console.WriteLine($"Đọc user + verify mật khẩu: {(ok ? "OK" : "FAIL")}");
Console.WriteLine();
Console.WriteLine($"Email:    {adminEmail}");
Console.WriteLine($"Mật khẩu: {newPassword}");
Console.WriteLine();
Console.WriteLine("QUAN TRỌNG: Dừng API cũ (Ctrl+C) rồi chạy lại:");
Console.WriteLine("  cd server/WebShop.Api");
Console.WriteLine("  dotnet run");
