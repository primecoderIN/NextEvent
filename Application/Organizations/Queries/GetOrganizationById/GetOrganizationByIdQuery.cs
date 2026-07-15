using Application.Organizations.DTOs;
using MediatR;

namespace Application.Organizations.Queries.GetOrganizationById;

/// <summary>Fetch a single organization by its primary key.</summary>
public class GetOrganizationByIdQuery : IRequest<OrganizationDetailDto>
{
    public required Guid Id { get; set; }
}
