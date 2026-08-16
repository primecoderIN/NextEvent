using NextEvent.Modules.Events.Persistence.Contexts;
using NextEvent.Modules.Events.Application.Categories.DTOs;
using NextEvent.Shared.Interfaces;
using NextEvent.Shared.Exceptions;
using NextEvent.Modules.Identity.Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Events.Application.Categories.Commands.RejectCategory;
public class RejectCategoryCommandHandler(
    EventsDbContext context,
    ICurrentUserService currentUserService,
    IDateTimeProvider dateTimeProvider)
    : IRequestHandler<RejectCategoryCommand, CategorySuggestionDto>
{
    public async Task<CategorySuggestionDto> Handle(RejectCategoryCommand request, CancellationToken cancellationToken)
    {
        var reviewerId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedException("Reviewer must be authenticated.");

        var suggestion = await context.CategorySuggestions
            .Include(s => s.SuggestedBy)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (suggestion is null)
            throw new NotFoundException(nameof(CategorySuggestion), request.Id);

        if (suggestion.Status != CategorySuggestionStatus.Pending)
            throw new BusinessRuleException("Only Pending suggestions can be rejected.");

        var now = dateTimeProvider.UtcNow;

        suggestion.Status           = CategorySuggestionStatus.Rejected;
        suggestion.ReviewedById     = reviewerId;
        suggestion.ReviewedAt       = now;
        suggestion.RejectionReason  = request.RejectionReason;
        suggestion.UpdatedAtUtc     = now;

        await context.SaveChangesAsync(cancellationToken);

        return new CategorySuggestionDto
        {
            Id                       = suggestion.Id,
            Name                     = suggestion.Name,
            Slug                     = suggestion.Slug,
            Description              = suggestion.Description,
            SuggestedByDisplayName   = suggestion.SuggestedBy?.DisplayName ?? "Unknown",
            CreatedAtUtc             = suggestion.CreatedAtUtc,
            Status                   = suggestion.Status.ToString(),
        };
    }
}
