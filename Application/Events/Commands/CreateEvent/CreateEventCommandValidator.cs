using Application.Events.Constants;
using FluentValidation;

namespace Application.Events.Commands.CreateEvent;

public class CreateEventCommandValidator : AbstractValidator<CreateEventCommand> 
{
    public CreateEventCommandValidator()
    {
        RuleFor(x => x.Event.Title)
            .NotEmpty()
            .WithMessage(ValidationErrors.TitleRequired);

        RuleFor(x => x.Event.Description)
            .NotEmpty()
            .WithMessage(ValidationErrors.DescriptionRequired);

        RuleFor(x => x.Event.CategoryId)
            .NotEmpty()
            .WithMessage(ValidationErrors.CategoryRequired);

        RuleFor(x => x.Event.Date)
            .NotEmpty()
            .WithMessage(ValidationErrors.DateRequired);

        RuleFor(x => x.Event.City)
            .NotEmpty()
            .WithMessage(ValidationErrors.CityRequired);

        RuleFor(x => x.Event.Venue)
            .NotEmpty()
            .WithMessage(ValidationErrors.VenueRequired);

        RuleFor(x => x.Event.Latitude)
            .InclusiveBetween(-90, 90)
            .WithMessage(ValidationErrors.LatitudeOutOfRange);

        RuleFor(x => x.Event.Longitude)
            .InclusiveBetween(-180, 180)
            .WithMessage(ValidationErrors.LongitudeOutOfRange);
    }
}

//NotEmpty >> Checks that the value is not null and not empty.
//NotNull >> Allows empty string, null not allowed
