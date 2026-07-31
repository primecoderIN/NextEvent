using FluentValidation;

namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.CreateOrganization;
public class CreateOrganizationCommandValidator : AbstractValidator<CreateOrganizationCommand>
{
    public CreateOrganizationCommandValidator()
    {
        RuleFor(x => x.Organization.Name)
            .NotEmpty().WithMessage("Organization name is required.")
            .MaximumLength(160).WithMessage("Organization name must not exceed 160 characters.");

        RuleFor(x => x.Organization.Slug)
            .NotEmpty().WithMessage("Slug is required.")
            .MaximumLength(180).WithMessage("Slug must not exceed 180 characters.")
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$")
            .WithMessage("Slug may only contain lowercase letters, numbers, and hyphens, and must not start or end with a hyphen.");

        RuleFor(x => x.Organization.ContactEmail)
            .EmailAddress().WithMessage("Contact email must be a valid email address.")
            .When(x => !string.IsNullOrWhiteSpace(x.Organization.ContactEmail));

        RuleFor(x => x.Organization.ContactPhone)
            .MaximumLength(40).WithMessage("Contact phone must not exceed 40 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Organization.ContactPhone));

        RuleFor(x => x.Organization.WebsiteUrl)
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Website URL must be a valid absolute URL.")
            .When(x => !string.IsNullOrWhiteSpace(x.Organization.WebsiteUrl));
    }
}
