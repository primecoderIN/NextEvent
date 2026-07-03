using FluentValidation;

namespace Application.Categories.Commands.SuggestCategory;

public class SuggestCategoryCommandValidator : AbstractValidator<SuggestCategoryCommand>
{
    public SuggestCategoryCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required").MaximumLength(200);
        RuleFor(x => x.Slug).MaximumLength(200).When(x => !string.IsNullOrWhiteSpace(x.Slug));
        RuleFor(x => x.Description).MaximumLength(2000);
    }
}
