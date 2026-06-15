using Application.Events.Commands;
using FluentValidation;

namespace Application.Events.Validators;

public class CreateEventValidator : AbstractValidator<CreateEvent.Command> 
{
    public CreateEventValidator()
    {
            RuleFor(x => x.Event.Title)
            .NotEmpty()
            .WithMessage("Title is required");

        RuleFor(x => x.Event.Description)
            .NotEmpty()
            .WithMessage("Description is required");

        RuleFor(x => x.Event.Category)
            .NotEmpty()
            .WithMessage("Category is required");

        RuleFor(x => x.Event.Date)
            .NotEmpty()
            .WithMessage("Date is required");

        RuleFor(x => x.Event.City)
            .NotEmpty()
            .WithMessage("City is required");

        RuleFor(x => x.Event.Venue)
            .NotEmpty()
            .WithMessage("Venue is required");

        RuleFor(x => x.Event.Latitude)
            .InclusiveBetween(-90, 90)
            .WithMessage("Latitude must be between -90 and 90");

        RuleFor(x => x.Event.Longitude)
            .InclusiveBetween(-180, 180)
            .WithMessage("Longitude must be between -180 and 180");

    }
}

//NotEmpty >> Checks that the value is not null and not empty.
//NotNull >> Allows empty string, null not allowed