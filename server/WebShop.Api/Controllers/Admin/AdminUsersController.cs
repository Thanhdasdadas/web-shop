using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Extensions;
using WebShop.Application.Common;
using WebShop.Application.DTOs;
using WebShop.Application.Services;
using WebShop.Domain.Enums;

namespace WebShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/users")]
[Authorize(Policy = "AdminOnly")]
public class AdminUsersController(IUserAdminService users) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<UserAdminSummaryDto>> GetSummary(CancellationToken ct) =>
        Ok(await users.GetSummaryAsync(ct));

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminUserDto>>> GetAll(
        [FromQuery] UserRole? role,
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default) =>
        Ok(await users.GetUsersAsync(role, search, isActive, page, pageSize, ct));

    [HttpPost]
    public async Task<ActionResult<AdminUserDto>> Create([FromBody] CreateAdminUserRequest request, CancellationToken ct) =>
        Ok(await users.CreateAsync(request, ct));

    [HttpPut("{id}")]
    public async Task<ActionResult<AdminUserDto>> Update(string id, [FromBody] UpdateAdminUserRequest request, CancellationToken ct) =>
        Ok(await users.UpdateAsync(id, request, User.GetUserId(), ct));

    [HttpPatch("{id}/role")]
    public async Task<ActionResult<AdminUserDto>> UpdateRole(string id, [FromBody] UpdateUserRoleRequest request, CancellationToken ct) =>
        Ok(await users.UpdateRoleAsync(id, request, User.GetUserId(), ct));

    [HttpPatch("{id}/active")]
    public async Task<ActionResult<AdminUserDto>> UpdateActive(string id, [FromBody] UpdateUserActiveRequest request, CancellationToken ct) =>
        Ok(await users.UpdateActiveAsync(id, request, User.GetUserId(), ct));

    [HttpPatch("{id}/password")]
    public async Task<IActionResult> ResetPassword(string id, [FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        await users.ResetPasswordAsync(id, request, ct);
        return NoContent();
    }
}
