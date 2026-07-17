using Application.Organizations.DTOs;
using MediatR;

namespace Application.Organizations.Queries.GetMyOrganization;

public class GetMyOrganizationQuery : IRequest<OrganizationDetailDto>
{
}
