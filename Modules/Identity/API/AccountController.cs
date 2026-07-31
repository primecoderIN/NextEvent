using NextEvent.Shared.Constants;
using NextEvent.Modules.Identity.Application.Authentication.Commands.Login;
using NextEvent.Modules.Identity.Application.Authentication.Commands.Logout;
using NextEvent.Modules.Identity.Application.Authentication.Commands.RefreshToken;
using NextEvent.Modules.Identity.Application.Authentication.Commands.Register;
using NextEvent.Modules.Identity.Application.Authentication.DTOs;
using NextEvent.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NextEvent.Modules.Identity.API;
[Route(ApiRouteConstants.Account.Base)]
public class AccountController : BaseApiController
{
    /// <summary>
    /// Registers a new user account and sets a refresh token.
    /// </summary>
    /// <param name="command">User registration details.</param>
    /// <response code="200">User registered successfully.</response>
    /// <response code="400">Validation failed.</response>
    [AllowAnonymous]
    [HttpPost(ApiRouteConstants.Account.Register)]
    [ProducesResponseType(typeof(ApiResponse<RegisterResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<RegisterResponseDto>>> RegisterUser([FromBody] RegisterCommand command)
    {
        var result = await Mediator.Send(command);
        SetRefreshTokenCookie(result.RefreshToken);
        return OkResponse(result.User, "Registered successfully");
    }

    /// <summary>
    /// Authenticates a user and sets a refresh token.
    /// </summary>
    /// <param name="command">User login credentials.</param>
    /// <response code="200">Login successful.</response>
    /// <response code="400">Validation failed.</response>
    /// <response code="401">Invalid credentials.</response>
    [AllowAnonymous]
    [HttpPost(ApiRouteConstants.Account.Login)]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> LoginUser([FromBody] LoginCommand command)
    {
        var result = await Mediator.Send(command);
        SetRefreshTokenCookie(result.RefreshToken);
        return OkResponse(result.User, "Logged in successfully");
    }

    /// <summary>
    /// Issues a new JWT access token using the refresh token cookie.
    /// </summary>
    /// <response code="200">Token refreshed successfully.</response>
    /// <response code="401">Refresh token is missing or invalid.</response>
    [AllowAnonymous]
    [HttpPost(ApiRouteConstants.Account.RefreshToken)]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];

        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(ApiResponse.Fail("Refresh token is missing"));

        var result = await Mediator.Send(new RefreshTokenCommand { Token = refreshToken });
        SetRefreshTokenCookie(result.RefreshToken);
        return OkResponse(result.User, "Token refreshed successfully");
    }

    /// <summary>
    /// Logs out the currently authenticated user and deletes the refresh token cookie.
    /// </summary>
    /// <response code="200">Logged out successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    [Authorize]
    [HttpPost(ApiRouteConstants.Account.Logout)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<object>>> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await Mediator.Send(new LogoutCommand { Token = refreshToken });
            Response.Cookies.Delete("refreshToken");
        }
        return OkResponse<object>(null!, "Logged out successfully");
    }

    /// <summary>
    /// Switches the active profile of the current user.
    /// </summary>
    /// <param name="command">Profile switch details.</param>
    /// <response code="200">Profile switched successfully.</response>
    /// <response code="401">User is not authorized to switch to this profile.</response>
    [Authorize]
    [HttpPost("switch-profile")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> SwitchProfile([FromBody] Application.Authentication.Commands.SwitchProfile.SwitchProfileCommand command)
    {
        var result = await Mediator.Send(command);
        SetRefreshTokenCookie(result.RefreshToken);
        return OkResponse(result.User, $"Switched to {command.Profile} profile");
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires  = DateTime.UtcNow.AddDays(7),
            Secure   = true,
            SameSite = SameSiteMode.None
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}
