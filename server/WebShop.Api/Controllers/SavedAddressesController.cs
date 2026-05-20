using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Extensions;
using WebShop.Application.DTOs;
using WebShop.Application.Services;

namespace WebShop.Api.Controllers;

[Authorize(Policy = "CustomerOnly")]
[ApiController]
[Route("api/addresses")]
public class SavedAddressesController(ISavedAddressService addresses) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<SavedAddressDto>>> GetAll(CancellationToken ct) =>
        Ok(await addresses.GetMyAddressesAsync(User.GetUserId(), ct));

    [HttpPost]
    public async Task<ActionResult<SavedAddressDto>> Create([FromBody] CreateSavedAddressRequest request, CancellationToken ct) =>
        Ok(await addresses.CreateAsync(User.GetUserId(), request, ct));

    [HttpPut("{id}")]
    public async Task<ActionResult<SavedAddressDto>> Update(string id, [FromBody] UpdateSavedAddressRequest request, CancellationToken ct) =>
        Ok(await addresses.UpdateAsync(User.GetUserId(), id, request, ct));

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        await addresses.DeleteAsync(User.GetUserId(), id, ct);
        return NoContent();
    }
}
