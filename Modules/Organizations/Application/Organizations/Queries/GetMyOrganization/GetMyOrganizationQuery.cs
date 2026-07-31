using NextEvent.Modules.Organizations.Application.Organizations.DTOs;
using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetMyOrganization;
public class GetMyOrganizationQuery : IRequest<OrganizationDetailDto>
{
}
