using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/products")]
[Authorize(Policy = "StaffOrAdmin")]
public class AdminProductUploadController(IWebHostEnvironment env) : ControllerBase
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    };

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif",
    };

    [HttpPost("upload-image")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<UploadImageResponse>> UploadImage(IFormFile? file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Chưa chọn file ảnh." });

        if (!AllowedContentTypes.Contains(file.ContentType))
            return BadRequest(new { message = "Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF." });

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
            ext = file.ContentType switch
            {
                "image/png" => ".png",
                "image/webp" => ".webp",
                "image/gif" => ".gif",
                _ => ".jpg",
            };

        var webRoot = env.WebRootPath;
        if (string.IsNullOrEmpty(webRoot))
            webRoot = Path.Combine(env.ContentRootPath, "wwwroot");

        var dir = Path.Combine(webRoot, "uploads", "products");
        Directory.CreateDirectory(dir);

        var fileName = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
        var fullPath = Path.Combine(dir, fileName);

        await using (var stream = System.IO.File.Create(fullPath))
            await file.CopyToAsync(stream, ct);

        return Ok(new UploadImageResponse($"/uploads/products/{fileName}"));
    }
}

public record UploadImageResponse(string Url);
