using FluentValidation;

namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.CreateOrganizationRole;
public class CreateOrganizationRoleCommandValidator : AbstractValidator<CreateOrganizationRoleCommand>
{
    public CreateOrganizationRoleCommandValidator()
    {
        RuleFor(x => x.OrganizationId)
            .NotEmpty().WithMessage("OrganizationId is required.");

        RuleFor(x => x.Role.Name)
            .NotEmpty().WithMessage("Role name is required.")
            .MaximumLength(80).WithMessage("Role name must not exceed 80 characters.");

        RuleFor(x => x.Role.Permissions)
            .NotNull().WithMessage("Permissions list cannot be null.");
    }
}
