namespace WebShop.Domain.Entities;

[BsonCollection("savedAddresses")]
public class SavedAddress : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string Label { get; set; } = "Nhà";
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string AddressLine { get; set; } = string.Empty;
    public string Ward { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}
