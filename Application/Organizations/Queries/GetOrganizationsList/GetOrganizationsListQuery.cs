namespace Application.Organizations.Queries.GetOrganizationsList;

using Application.Core.Pagination;
using Application.Organizations.DTOs;
using MediatR;

public class GetOrganizationsListQuery : PaginationParams, IRequest<PagedList<OrganizationDetailDto>>
{
}
