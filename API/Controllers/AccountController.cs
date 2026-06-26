using Application.Authentication.Commands.Login;
using Application.Authentication.Commands.Logout;
using Application.Authentication.Commands.RefreshToken;
using Application.Authentication.Commands.Register;
using Application.Authentication.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class AccountController : BaseApiController
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<UserDTO>> RegisterUser([FromBody] RegisterCommand command)
    {
        var result = await Mediator.Send(command);
        SetRefreshTokenCookie(result.RefreshToken);
        return result.User;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<UserDTO>> LoginUser([FromBody] LoginCommand command)
    {
        var result = await Mediator.Send(command);
        SetRefreshTokenCookie(result.RefreshToken);
        return result.User;
    }

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<ActionResult<UserDTO>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized("Refresh token is missing");

        var result = await Mediator.Send(new RefreshTokenCommand { Token = refreshToken });
        SetRefreshTokenCookie(result.RefreshToken);
        return result.User;
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await Mediator.Send(new LogoutCommand { Token = refreshToken });
            Response.Cookies.Delete("refreshToken");
        }
        return Ok("Logged out successfully");
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTime.UtcNow.AddDays(7),
            Secure = true,     // Needs to be true for HTTPS
            SameSite = SameSiteMode.None // Adjust according to frontend location
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}
