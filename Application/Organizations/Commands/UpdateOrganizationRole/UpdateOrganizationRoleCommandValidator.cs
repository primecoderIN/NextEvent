using FluentValidation;

namespace Application.Organizations.Commands.UpdateOrganizationRole;

public class UpdateOrganizationRoleCommandValidator : AbstractValidator<UpdateOrganizationRoleCommand>
{
    public UpdateOrganizationRoleCommandValidator()
    {
        RuleFor(x => x.OrganizationId)
            .NotEmpty().WithMessage("OrganizationId is required.");

        RuleFor(x => x.RoleId)
            .NotEmpty().WithMessage("RoleId is required.");

        RuleFor(x => x.Role.Name)
            .NotEmpty().WithMessage("Role name cannot be empty if provided.")
            .MaximumLength(80).WithMessage("Role name must not exceed 80 characters.")
            .When(x => x.Role.Name != null);
    }
}
