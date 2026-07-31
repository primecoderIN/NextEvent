using FluentValidation;

namespace NextEvent.Modules.Events.Application.Categories.Commands.SuggestCategory;
public class SuggestCategoryCommandValidator : AbstractValidator<SuggestCategoryCommand>
{
    public SuggestCategoryCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200)
            .Must(name => !string.IsNullOrWhiteSpace(name)).WithMessage("Name cannot be only whitespace");

        RuleFor(x => x.Slug)
            .MaximumLength(200)
            .Matches("^[a-z0-9-]+$").WithMessage("Slug can only contain lowercase letters, numbers, and hyphens")
            .When(x => !string.IsNullOrWhiteSpace(x.Slug));

        RuleFor(x => x.Description)
            .MaximumLength(2000);
    }
}
