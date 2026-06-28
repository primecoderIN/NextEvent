using API.Common;
using Application.Authentication.Commands.Login;
using Application.Authentication.Commands.Logout;
using Application.Authentication.Commands.RefreshToken;
using Application.Authentication.Commands.Register;
using Application.Authentication.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers;

[Route("api/account")]
public class AccountController : BaseApiController
{
    /// <summary>
    /// Registers a new user account and sets a refresh token.
    /// </summary>
    /// <param name="command">User registration details.</param>
    /// <response code="200">User registered successfully.</response>
    /// <response code="400">Validation failed.</response>
    [AllowAnonymous]
    [HttpPost("register")]
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
    [HttpPost("login")]
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
    [HttpPost("refresh-token")]
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
    [HttpPost("logout")]
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
