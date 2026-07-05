using Application.Categories.DTOs;
using Application.Core.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Categories.Commands.RejectCategory;

public class RejectCategoryCommandHandler(
    IAppDBContext context,
    ICurrentUserService currentUserService)
    : IRequestHandler<RejectCategoryCommand, CategorySuggestionDto>
{
    public async Task<CategorySuggestionDto> Handle(RejectCategoryCommand request, CancellationToken cancellationToken)
    {
        var reviewerId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("Reviewer must be authenticated.");

        var suggestion = await context.CategorySuggestions
            .Include(s => s.SuggestedBy)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (suggestion is null)
            throw new KeyNotFoundException($"Category suggestion {request.Id} not found.");

        if (suggestion.Status != CategorySuggestionStatus.Pending)
            throw new InvalidOperationException("Only Pending suggestions can be rejected.");

        suggestion.Status           = CategorySuggestionStatus.Rejected;
        suggestion.ReviewedById     = reviewerId;
        suggestion.ReviewedAt       = DateTime.UtcNow;
        suggestion.RejectionReason  = request.RejectionReason;
        suggestion.UpdatedAtUtc     = DateTime.UtcNow;

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
