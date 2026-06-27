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
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<UserDTO>>> RegisterUser([FromBody] RegisterCommand command)
    {
        var result = await Mediator.Send(command);
        SetRefreshTokenCookie(result.RefreshToken);
        return OkResponse(result.User, "Registered successfully");
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<UserDTO>>> LoginUser([FromBody] LoginCommand command)
    {
        var result = await Mediator.Send(command);
        SetRefreshTokenCookie(result.RefreshToken);
        return OkResponse(result.User, "Logged in successfully");
    }

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<ActionResult<ApiResponse<UserDTO>>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];

        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(ApiResponse.Fail("Refresh token is missing"));

        var result = await Mediator.Send(new RefreshTokenCommand { Token = refreshToken });
        SetRefreshTokenCookie(result.RefreshToken);
        return OkResponse(result.User, "Token refreshed successfully");
    }

    [Authorize]
    [HttpPost("logout")]
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
