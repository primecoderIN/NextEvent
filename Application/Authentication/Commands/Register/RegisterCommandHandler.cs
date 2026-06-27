using Application.Authentication.DTOs;
using Application.Authentication.Interfaces;
// using Domain;
// using FluentValidation;
using FluentValidation.Results;
// using MediatR;
using Microsoft.AspNetCore.Identity;
// using Microsoft.EntityFrameworkCore;

namespace Application.Authentication.Commands.Register;

public class RegisterCommandHandler(UserManager<User> userManager, ITokenService tokenService) 
    : IRequestHandler<RegisterCommand, AuthResult>
{
    public async Task<AuthResult> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await userManager.Users.AnyAsync(x => x.Email == request.Email, cancellationToken))
        {
            throw new ValidationException(new List<ValidationFailure> { new("Email", "Email taken") });
        }
        
        if (await userManager.Users.AnyAsync(x => x.UserName == request.UserName, cancellationToken))
        {
            throw new ValidationException(new List<ValidationFailure> { new("UserName", "Username taken") });
        }

        var newUser = new User
        {
            DisplayName = request.DisplayName,
            Email = request.Email,
            UserName = request.UserName
        };

        var result = await userManager.CreateAsync(newUser, request.Password);

        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => new ValidationFailure("Registration", e.Description)).ToList();
            throw new ValidationException(errors);
        }

        await userManager.AddToRoleAsync(newUser, "Member");

        var refreshToken = tokenService.GenerateRefreshToken();
        newUser.RefreshToken = refreshToken;
        newUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await userManager.UpdateAsync(newUser);

        var userDto = new UserDTO
        {
            DisplayName = newUser.DisplayName ?? newUser.UserName!,
            Token = tokenService.CreateToken(newUser),
            UserName = newUser.UserName!,
            Image = newUser.ImageUrl
        };

        return new AuthResult
        {
            User = userDto,
            RefreshToken = refreshToken
        };
    }
}
