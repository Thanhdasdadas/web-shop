namespace WebShop.Application.DTOs;

public record RevenuePointDto(string Label, decimal Revenue, long OrderCount);
public record TopProductDto(string ProductId, string ProductName, long QuantitySold, decimal Revenue);
public record SalesReportDto(
    decimal TotalRevenue,
    long TotalOrders,
    long DeliveredOrders,
    List<RevenuePointDto> RevenueByPeriod,
    List<TopProductDto> TopProducts);
