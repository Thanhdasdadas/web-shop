using FluentValidation;
using WebShop.Application.DTOs;

namespace WebShop.Application.Validators;

public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Sku).NotEmpty();
        RuleFor(x => x.InitialStock).GreaterThanOrEqualTo(0);
    }
}

public class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.Slug).NotEmpty();
    }
}

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.ShippingAddress).NotNull().WithMessage("Thiếu địa chỉ giao hàng.");
        When(x => x.ShippingAddress != null, () =>
        {
            RuleFor(x => x.ShippingAddress!.FullName).NotEmpty().WithMessage("Nhập họ tên người nhận.");
            RuleFor(x => x.ShippingAddress!.Phone).NotEmpty().WithMessage("Nhập số điện thoại.");
            RuleFor(x => x.ShippingAddress!.AddressLine).NotEmpty().WithMessage("Nhập số nhà, tên đường.");
            RuleFor(x => x.ShippingAddress!.City).NotEmpty().WithMessage("Chọn tỉnh/thành phố.");
            RuleFor(x => x.ShippingAddress!.District).NotEmpty().WithMessage("Chọn quận/huyện.");
        });
    }
}
