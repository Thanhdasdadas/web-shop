using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using WebShop.Application.Services;
using WebShop.Application.Validators;

namespace WebShop.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICatalogService, CatalogService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IUserAdminService, UserAdminService>();
        return services;
    }
}
