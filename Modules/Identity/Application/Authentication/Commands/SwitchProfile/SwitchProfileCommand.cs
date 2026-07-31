using MediatR;
using NextEvent.Modules.Identity.Application.Authentication.DTOs;

namespace NextEvent.Modules.Identity.Application.Authentication.Commands.SwitchProfile;
public class SwitchProfileCommand : IRequest<AuthResult<LoginResponseDto>>
{
    public required string Profile { get; set; }
}
