using MediatR;
using Application.Authentication.DTOs;

namespace Application.Authentication.Commands.SwitchProfile;

public class SwitchProfileCommand : IRequest<AuthResult<LoginResponseDto>>
{
    public required string Profile { get; set; }
}
