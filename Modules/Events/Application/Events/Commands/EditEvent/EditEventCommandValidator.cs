using NextEvent.Modules.Events.Application.Events.DTOs;
using FluentValidation;

namespace NextEvent.Modules.Events.Application.Events.Commands.EditEvent;
/// <summary>
/// Validates `EditEventCommand` using PATCH-style rules: only fields
/// provided by the client are validated. Uses `When(...)` and
/// `RuleFor(...).When(...)` to avoid nullable dereference warnings
/// and to keep validation conditional and focused.
/// </summary>
public class EditEventCommandValidator : AbstractValidator<EditEventCommand>
{
    public EditEventCommandValidator()
    {
        // Validate fields only when they are provided (not null).
        // This preserves PATCH semantics: omitted fields are ignored.
        When(x => x.EventData.Title != null, () =>
        {
            // Only run the Title rules if the client included a Title.
            RuleFor(x => x.EventData.Title)
                .NotEmpty()
                .WithMessage("Title cannot be empty when provided")
                .MaximumLength(200);
        });

        When(x => x.EventData.Description != null, () =>
        {
            // Description is optional for PATCH; validate only when present.
            RuleFor(x => x.EventData.Description)
                .NotEmpty()
                .WithMessage("Description cannot be empty when provided");
        });

        When(x => x.EventData.CategoryId.HasValue, () =>
        {
            RuleFor(x => x.EventData.CategoryId)
                .NotEmpty()
                .WithMessage("CategoryId cannot be empty when provided");
        });

        // For nullable DateTime we validate the nullable itself rather
        // than accessing `.Value` — this avoids CS8602 warnings from
        // the compiler/analyzer while keeping the conditional check.
        When(x => x.EventData.Date.HasValue, () =>
        {
            RuleFor(x => x.EventData.Date)
                .NotEmpty()
                .WithMessage("Date cannot be empty when provided");
        });

        When(x => x.EventData.City != null, () =>
        {
            // City is validated only if included in the payload.
            RuleFor(x => x.EventData.City)
                .NotEmpty()
                .WithMessage("City cannot be empty when provided");
        });

        When(x => x.EventData.Venue != null, () =>
        {
            // Venue is validated only if included in the payload.
            RuleFor(x => x.EventData.Venue)
                .NotEmpty()
                .WithMessage("Venue cannot be empty when provided");
        });

        // Validate nullable numeric properties directly and attach
        // the .When guard. This prevents nullable dereference warnings
        // and applies the range check only when the value exists.
        RuleFor(x => x.EventData.Latitude)
            .InclusiveBetween(-90, 90)
            .When(x => x.EventData.Latitude.HasValue)
            .WithMessage("Latitude out of range");

        RuleFor(x => x.EventData.Longitude)
            .InclusiveBetween(-180, 180)
            .When(x => x.EventData.Longitude.HasValue)
            .WithMessage("Longitude out of range");
    }
}
