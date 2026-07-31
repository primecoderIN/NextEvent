namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationsList;
using NextEvent.Shared.Pagination;
using NextEvent.Modules.Organizations.Application.Organizations.DTOs;
using MediatR;

public class GetOrganizationsListQuery : PaginationParams, IRequest<PagedList<OrganizationDetailDto>>
{
}
