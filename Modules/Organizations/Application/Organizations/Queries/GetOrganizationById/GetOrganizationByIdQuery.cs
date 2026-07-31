using NextEvent.Modules.Organizations.Application.Organizations.DTOs;
using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationById;
/// <summary>Fetch a single organization by its primary key.</summary>
public class GetOrganizationByIdQuery : IRequest<OrganizationDetailDto>
{
    public required Guid Id { get; set; }
}
