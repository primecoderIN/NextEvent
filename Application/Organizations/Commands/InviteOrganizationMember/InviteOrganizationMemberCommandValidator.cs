using FluentValidation;

namespace Application.Organizations.Commands.InviteOrganizationMember;

public class InviteOrganizationMemberCommandValidator : AbstractValidator<InviteOrganizationMemberCommand>
{
    public InviteOrganizationMemberCommandValidator()
    {
        RuleFor(x => x.OrganizationId)
            .NotEmpty().WithMessage("Organization ID is required.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");
    }
}
