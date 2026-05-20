using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Enums;

namespace WebShop.Application.Services;

public interface IReportService
{
    Task<SalesReportDto> GetSalesReportAsync(DateTime? from, DateTime? to, string groupBy, CancellationToken ct = default);
}

public class ReportService(IOrderRepository orders) : IReportService
{
    public async Task<SalesReportDto> GetSalesReportAsync(DateTime? from, DateTime? to, string groupBy, CancellationToken ct = default)
    {
        var delivered = await orders.GetDeliveredInRangeAsync(from, to, ct);
        var allInRange = (await orders.GetAllAsync(ct))
            .Where(o => (!from.HasValue || o.CreatedAt >= from) && (!to.HasValue || o.CreatedAt <= to))
            .ToList();

        var totalRevenue = delivered.Sum(o => o.Total);
        var revenuePoints = groupBy.ToLowerInvariant() switch
        {
            "month" => delivered
                .GroupBy(o => o.CreatedAt.ToString("yyyy-MM"))
                .OrderBy(g => g.Key)
                .Select(g => new RevenuePointDto(g.Key, g.Sum(x => x.Total), g.Count()))
                .ToList(),
            _ => delivered
                .GroupBy(o => o.CreatedAt.ToString("yyyy-MM-dd"))
                .OrderBy(g => g.Key)
                .Select(g => new RevenuePointDto(g.Key, g.Sum(x => x.Total), g.Count()))
                .ToList()
        };

        var topProducts = delivered
            .SelectMany(o => o.Items)
            .GroupBy(i => i.ProductId)
            .Select(g => new TopProductDto(
                g.Key,
                g.First().ProductName,
                g.Sum(x => x.Quantity),
                g.Sum(x => x.LineTotal)))
            .OrderByDescending(x => x.Revenue)
            .Take(10)
            .ToList();

        return new SalesReportDto(
            totalRevenue,
            allInRange.Count,
            delivered.Count,
            revenuePoints,
            topProducts);
    }
}
