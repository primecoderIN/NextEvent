using Application.Authentication.DTOs;
using Application.Authentication.Interfaces;
using Domain;
using Domain.Constants;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Authentication.Commands.Register;

public class RegisterCommandHandler(UserManager<User> userManager, ITokenService tokenService) : IRequestHandler<RegisterCommand, AuthResult<RegisterResponseDto>>
{
    public async Task<AuthResult<RegisterResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await userManager.Users.AnyAsync(x => x.UserName == request.UserName, cancellationToken))
        {
            throw new ValidationException(new List<ValidationFailure> 
            { 
                new ValidationFailure("UserName", "Username is already taken") 
            });
        }

        if (await userManager.Users.AnyAsync(x => x.Email == request.Email, cancellationToken))
        {
            throw new ValidationException(new List<ValidationFailure> 
            { 
                new ValidationFailure("Email", "Email is already taken") 
            });
        }

        var user = new User
        {
            DisplayName = request.DisplayName,
            Email = request.Email,
            UserName = request.UserName
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => new ValidationFailure(e.Code, e.Description)).ToList();
            throw new ValidationException(errors);
        }
        
        await userManager.AddToRoleAsync(user, RoleConstants.Member);

        var refreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await userManager.UpdateAsync(user);

        var roles = await userManager.GetRolesAsync(user);

        var userDto = new RegisterResponseDto
        {
            DisplayName = user.DisplayName ?? user.UserName!,
            Image = user.ImageUrl,
            // Pass roles to CreateToken so they are embedded in the JWT claims
            Token = tokenService.CreateToken(user, roles),
            Username = user.UserName!,
            Roles = roles
        };

        return new AuthResult<RegisterResponseDto>
        {
            User = userDto,
            RefreshToken = refreshToken
        };
    }
}
