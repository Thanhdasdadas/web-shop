using System.Text;
using MongoDB.Bson.Serialization.Conventions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using WebShop.Application.Interfaces;
using WebShop.Application.Services;
using WebShop.Domain.Entities;
using WebShop.Infrastructure.Auth;
using WebShop.Infrastructure.Export;
using WebShop.Infrastructure.Persistence;
using WebShop.Infrastructure.Persistence.Repositories;
using WebShop.Infrastructure.Seed;
using WebShop.Infrastructure.Settings;

namespace WebShop.Infrastructure;

public static class DependencyInjection
{
    static DependencyInjection()
    {
        var pack = new ConventionPack
        {
            new CamelCaseElementNameConvention(),
            new IgnoreExtraElementsConvention(true),
        };
        ConventionRegistry.Register("WebShopCamelCase", pack, _ => true);
    }

    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MongoDbSettings>(configuration.GetSection(MongoDbSettings.SectionName));
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<GoogleSettings>(o =>
        {
            configuration.GetSection(GoogleSettings.SectionName).Bind(o);
            if (string.IsNullOrWhiteSpace(o.ClientId))
                o.ClientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") ?? "";
        });
        services.Configure<SeedSettings>(configuration.GetSection(SeedSettings.SectionName));
        services.Configure<DemoResetSettings>(configuration.GetSection(DemoResetSettings.SectionName));
        services.PostConfigure<DemoResetSettings>(opts =>
        {
            if (string.Equals(Environment.GetEnvironmentVariable("ALLOW_DEMO_RESET"), "true", StringComparison.OrdinalIgnoreCase))
                opts.Enabled = true;
        });

        services.AddSingleton<MongoDbContext>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IInventoryRepository, InventoryRepository>();
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IOrderStatusHistoryRepository, OrderStatusHistoryRepository>();
        services.AddScoped<ICouponRepository, CouponRepository>();
        services.AddScoped<ISavedAddressRepository, SavedAddressRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<IWishlistRepository, WishlistRepository>();
        services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
        services.AddScoped<IRepository<InventoryLog>, MongoRepository<InventoryLog>>();

        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IGoogleTokenValidator, GoogleTokenValidator>();
        services.AddScoped<IExportService, ExportService>();
        services.AddScoped<DataSeeder>();

        var jwt = configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>() ?? new JwtSettings();
        var key = Encoding.UTF8.GetBytes(jwt.Secret.Length >= 32 ? jwt.Secret : jwt.Secret.PadRight(32, '0'));

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.AddAuthorizationBuilder()
            .AddPolicy("CustomerOnly", p => p.RequireRole("Customer", "Staff", "Admin"))
            .AddPolicy("StaffOrAdmin", p => p.RequireRole("Staff", "Admin"))
            .AddPolicy("AdminOnly", p => p.RequireRole("Admin"));

        return services;
    }
}
