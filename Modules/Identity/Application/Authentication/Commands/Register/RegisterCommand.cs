using NextEvent.Modules.Identity.Application.Authentication.DTOs;
using MediatR;

namespace NextEvent.Modules.Identity.Application.Authentication.Commands.Register;
public class RegisterCommand : IRequest<AuthResult<RegisterResponseDto>>
{
    public required string DisplayName { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string UserName { get; set; }
}
