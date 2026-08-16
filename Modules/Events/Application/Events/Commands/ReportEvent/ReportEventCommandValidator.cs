using FluentValidation;

namespace NextEvent.Modules.Events.Application.Events.Commands.ReportEvent;

public class ReportEventCommandValidator : AbstractValidator<ReportEventCommand>
{
    public ReportEventCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Event id is required.");

        RuleFor(x => x.Reason)
            .NotEmpty()
            .WithMessage("Report reason is required.")
            .MaximumLength(1000)
            .WithMessage("Report reason cannot exceed 1000 characters.");
    }
}
