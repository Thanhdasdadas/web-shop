namespace WebShop.Application.DTOs;

public record DemoResetRequest(string ConfirmPhrase);

public record DemoResetResultDto(
    bool Success,
    string Message,
    int OrdersRemoved,
    int CustomersRemoved,
    int ProductsSeeded);

public record DemoResetStatusDto(bool Enabled, string ConfirmPhraseRequired);
