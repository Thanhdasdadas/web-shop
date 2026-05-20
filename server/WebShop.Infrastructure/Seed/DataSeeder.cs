using Microsoft.Extensions.Logging;
using WebShop.Application.Interfaces;
using WebShop.Domain.Entities;
using WebShop.Domain.Enums;
using WebShop.Infrastructure.Settings;
using Microsoft.Extensions.Options;

namespace WebShop.Infrastructure.Seed;

public class DataSeeder(
    IUserRepository users,
    ICategoryRepository categories,
    IProductRepository products,
    IInventoryRepository inventory,
    ICouponRepository coupons,
    IPasswordHasher passwordHasher,
    IOptions<SeedSettings> seedOptions,
    ILogger<DataSeeder> logger)
{
    public async Task SeedAsync(CancellationToken ct = default)
    {
        await EnsureBootstrapAdminAsync(ct);

        var seed = seedOptions.Value;
        var existingCategories = await categories.GetAllAsync(ct);
        if (seed.ForceReseedCatalog && existingCategories.Count > 0)
        {
            logger.LogInformation("Force reseed catalog — xóa dữ liệu mẫu cũ...");
            await ClearCatalogAsync(ct);
            existingCategories = [];
        }

        if (existingCategories.Count == 0)
        {
            logger.LogInformation("Seeding catalog Flower Knows...");
            await SeedFlowerKnowsCatalogAsync(ct);
            logger.LogInformation("Catalog Flower Knows đã seed.");
        }

        await EnsureSampleCouponsAsync(ct);
    }

    private async Task EnsureSampleCouponsAsync(CancellationToken ct)
    {
        if (await coupons.GetByCodeAsync("GLOW10", ct) != null) return;
        await coupons.InsertAsync(new Coupon
        {
            Code = "GLOW10",
            DiscountType = CouponDiscountType.Percent,
            Value = 10,
            MinOrderAmount = 300000,
            MaxDiscount = 100000,
            UsageLimit = 100,
            IsActive = true
        }, ct);
        logger.LogInformation("Đã seed mã giảm giá mẫu GLOW10.");
    }

    private async Task EnsureBootstrapAdminAsync(CancellationToken ct)
    {
        if (await users.AnyAdminExistsAsync(ct)) return;

        var email = Environment.GetEnvironmentVariable("BOOTSTRAP_ADMIN_EMAIL");
        var password = Environment.GetEnvironmentVariable("BOOTSTRAP_ADMIN_PASSWORD");

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning(
                "Chưa có tài khoản Admin. Đặt BOOTSTRAP_ADMIN_EMAIL và BOOTSTRAP_ADMIN_PASSWORD rồi khởi động lại API.");
            return;
        }

        var (hash, salt) = passwordHasher.HashWithNewSalt(password);
        await users.InsertAsync(new User
        {
            Email = email.Trim().ToLowerInvariant(),
            PasswordHash = hash,
            PasswordSalt = salt,
            FullName = "Quản trị viên",
            Role = UserRole.Admin,
            IsActive = true
        }, ct);

        logger.LogInformation("Đã tạo tài khoản Admin: {Email} (mật khẩu từ BOOTSTRAP_ADMIN_PASSWORD)", email.Trim().ToLowerInvariant());
    }

    private async Task ClearCatalogAsync(CancellationToken ct)
    {
        foreach (var inv in await inventory.GetAllAsync(ct))
            await inventory.DeleteAsync(inv.Id, ct);
        foreach (var p in await products.GetAllAsync(ct))
            await products.DeleteAsync(p.Id, ct);
        foreach (var c in await categories.GetAllAsync(ct))
            await categories.DeleteAsync(c.Id, ct);
    }

    private async Task SeedFlowerKnowsCatalogAsync(CancellationToken ct)
    {
        var catLip = new Category { Name = "Son môi Flower Knows", Slug = "son-moi", IsActive = true };
        var catEye = new Category { Name = "Phấn mắt & má", Slug = "phan-mat-ma", IsActive = true };
        var catFace = new Category { Name = "Phấn nền & highlight", Slug = "phan-nen", IsActive = true };
        var catCollection = new Category { Name = "Bộ sưu tập limited", Slug = "bo-suu-tap", IsActive = true };
        await categories.InsertAsync(catLip, ct);
        await categories.InsertAsync(catEye, ct);
        await categories.InsertAsync(catFace, ct);
        await categories.InsertAsync(catCollection, ct);

        var sampleProducts = new (string Name, string Slug, string Desc, decimal Price, string CatId, string Sku, int Stock, string Image)[]
        {
            (
                "Flower Knows Swan Ballet — Son kem Velvet",
                "fk-swan-ballet-lip-velvet",
                "Bộ sưu tập Swan Ballet: son kem lì texture velvet, packaging thiên nga cổ tích. Màu hồng ballet dịu nhẹ.",
                429000m, catLip.Id, "FK-LIP-001", 48,
                "https://images.unsplash.com/photo-1586495777744-4413d210dafe?w=600&h=600&fit=crop"
            ),
            (
                "Flower Knows Butterfly Cloud — Son dưỡng",
                "fk-butterfly-cloud-lipstick",
                "Dòng Butterfly Cloud: son bóng trong suốt, ánh nhũ nhẹ, cảm giác mây bướm trên môi.",
                389000m, catLip.Id, "FK-LIP-002", 62,
                "https://images.unsplash.com/photo-1631214524020-7e452fb62d49?w=600&h=600&fit=crop"
            ),
            (
                "Flower Knows Sweetie Bear — Son tint gấu",
                "fk-sweetie-bear-lip-tint",
                "Sweetie Bear Collection: son tint màu hồng đào ngọt, vỏ hộp gấu collectible.",
                359000m, catLip.Id, "FK-LIP-003", 55,
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop"
            ),
            (
                "Flower Knows Shell's Jewel — Bảng mắt 10 ô",
                "fk-shells-jewel-eyeshadow",
                "Shell's Jewel: bảng phấn mắt nhũ vỏ sò, tone hồng champagne & coral, blend mịn.",
                789000m, catEye.Id, "FK-EYE-001", 32,
                "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop"
            ),
            (
                "Flower Knows Moonlight Mermaid — Bảng mắt",
                "fk-moonlight-mermaid-palette",
                "Moonlight Mermaid: tone xanh tím hồng ánh ngọc trai, packaging nàng tiên cá.",
                849000m, catEye.Id, "FK-EYE-002", 28,
                "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop"
            ),
            (
                "Flower Knows Strawberry Rococo — Phấn má",
                "fk-strawberry-rococo-blush",
                "Strawberry Rococo: phấn má hồng dâu Rococo, finish satin tự nhiên, hương ngọt nhẹ.",
                459000m, catEye.Id, "FK-BLUSH-001", 40,
                "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop"
            ),
            (
                "Flower Knows Little Angel — Highlight",
                "fk-little-angel-highlight",
                "Little Angel: bắt sáng bột ánh kim hồng, góc cạnh thiên thần vintage.",
                529000m, catFace.Id, "FK-HL-001", 36,
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop"
            ),
            (
                "Flower Knows Victorian Bouquet — Cushion",
                "fk-victorian-bouquet-cushion",
                "Victorian Bouquet: cushion nền mỏng nhẹ, che phủ tự nhiên, tone hồng porcelain.",
                699000m, catFace.Id, "FK-FACE-001", 25,
                "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop"
            ),
            (
                "Flower Knows Teddy Bear — Bộ quà son + má",
                "fk-teddy-bear-gift-set",
                "Set quà Teddy Bear: son tint + phấn má mini, hộp teddy limited edition.",
                990000m, catCollection.Id, "FK-SET-001", 18,
                "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=600&fit=crop"
            ),
            (
                "Flower Knows Midsummer Fairy — Bảng má & mắt",
                "fk-midsummer-fairy-palette",
                "Midsummer Fairy: palette đa năng má hồng peach & mắt nhũ hoa, packaging fairy tale.",
                920000m, catCollection.Id, "FK-SET-002", 15,
                "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop"
            ),
        };

        foreach (var (name, slug, desc, price, catId, sku, stock, image) in sampleProducts)
        {
            var product = new Product
            {
                Name = name, Slug = slug, Description = desc, Images = [image],
                Price = price, CategoryId = catId, Sku = sku, IsPublished = true
            };
            await products.InsertAsync(product, ct);
            await inventory.InsertAsync(new Inventory
            {
                ProductId = product.Id, QuantityOnHand = stock, LowStockThreshold = 5
            }, ct);
        }
    }
}
