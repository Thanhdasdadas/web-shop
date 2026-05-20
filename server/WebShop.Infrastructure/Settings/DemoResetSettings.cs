namespace WebShop.Infrastructure.Settings;

public class DemoResetSettings
{
    public const string SectionName = "DemoReset";

    /// <summary>Cho phép POST /api/admin/demo/reset (mặc định true ở Development).</summary>
    public bool Enabled { get; set; }
}
