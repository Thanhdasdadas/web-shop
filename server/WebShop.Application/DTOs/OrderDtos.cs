using WebShop.Domain.Enums;

namespace WebShop.Application.DTOs;

public record ShippingAddressDto(string FullName, string Phone, string AddressLine, string? Ward, string District, string City);
public record CreateOrderRequest(ShippingAddressDto ShippingAddress, string? Note);
public record OrderItemDto(string ProductId, string ProductName, string Sku, decimal UnitPrice, int Quantity, decimal LineTotal);
public record OrderDto(
    string Id, string OrderNumber, OrderStatus Status, PaymentStatus PaymentStatus,
    PaymentMethod PaymentMethod, List<OrderItemDto> Items, ShippingAddressDto ShippingAddress,
    decimal Subtotal, decimal ShippingFee, decimal Total, string? Note, DateTime CreatedAt);
public record UpdateOrderStatusRequest(OrderStatus Status, string? Note);
