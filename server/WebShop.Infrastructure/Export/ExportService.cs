using MiniExcelLibs;
using WebShop.Application.DTOs;
using WebShop.Application.Interfaces;
using WebShop.Domain.Enums;

namespace WebShop.Infrastructure.Export;

public interface IExportService
{
    Task<byte[]> ExportOrdersAsync(OrderStatus? status, CancellationToken ct = default);
    Task<byte[]> ExportProductsAsync(CancellationToken ct = default);
}

public class ExportService(IOrderRepository orders, IProductRepository products, IInventoryRepository inventory) : IExportService
{
    public async Task<byte[]> ExportOrdersAsync(OrderStatus? status, CancellationToken ct = default)
    {
        var paged = await orders.GetPagedAdminAsync(status, 1, 10_000, ct);
        var rows = paged.Items.Select(o => new
        {
            MaDon = o.OrderNumber,
            TrangThai = o.Status.ToString(),
            ThanhToan = o.PaymentStatus.ToString(),
            KhachHang = o.ShippingAddress.FullName,
            SDT = o.ShippingAddress.Phone,
            TamTinh = o.Subtotal,
            GiamGia = o.DiscountAmount,
            MaGG = o.CouponCode ?? "",
            PhiShip = o.ShippingFee,
            Tong = o.Total,
            NgayTao = o.CreatedAt.ToString("yyyy-MM-dd HH:mm")
        });
        using var stream = new MemoryStream();
        await stream.SaveAsAsync(rows, cancellationToken: ct);
        return stream.ToArray();
    }

    public async Task<byte[]> ExportProductsAsync(CancellationToken ct = default)
    {
        var all = await products.GetAllAsync(ct);
        var rows = new List<object>();
        foreach (var p in all)
        {
            var inv = await inventory.GetByProductIdAsync(p.Id, ct);
            rows.Add(new
            {
                Ten = p.Name,
                SKU = p.Sku,
                Gia = p.Price,
                Ton = inv?.QuantityOnHand ?? 0,
                DaBan = p.IsPublished ? "Có" : "Ẩn"
            });
        }
        using var stream = new MemoryStream();
        await stream.SaveAsAsync(rows, cancellationToken: ct);
        return stream.ToArray();
    }
}
