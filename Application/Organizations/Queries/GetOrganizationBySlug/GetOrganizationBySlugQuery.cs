using Application.Organizations.DTOs;
using MediatR;

namespace Application.Organizations.Queries.GetOrganizationBySlug;

/// <summary>
/// Fetches the public profile of an organization identified by its slug.
/// No authentication required — this is an unauthenticated read endpoint.
/// </summary>
public class GetOrganizationBySlugQuery : IRequest<OrganizationPublicProfileDto>
{
    /// <summary>The URL-friendly slug of the organization (e.g. "acme-events").</summary>
    public required string Slug { get; set; }
}
