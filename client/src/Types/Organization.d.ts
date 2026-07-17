export type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: 'pending_verification' | 'active' | 'suspended' | 'rejected';
  ownerUserId: string;
  ownerDisplayName: string | null;
  createdAtUtc: string;
}

export type CreateOrganizationDto = {
  name: string;
  slug: string;
  description?: string | null;
  websiteUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export type PublicEventSummaryDto = {
  id: string;
  title: string;
  startDateUtc: string;
  endDateUtc: string;
  venueName?: string | null;
  city?: string | null;
  country?: string | null;
  bannerImageUrl?: string | null;
  status: string;
}

export type OrganizationPublicProfileDto = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  websiteUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  ownerDisplayName?: string | null;
  createdAtUtc: string;
  upcomingEvents: PublicEventSummaryDto[];
}

export type CreateOrganizationRoleDto = {
  name: string;
  description?: string | null;
  permissions: string[];
}

export type UpdateOrganizationRoleDto = {
  name: string;
  description?: string | null;
  permissions: string[];
}

export type OrganizationRole = {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  permissions: string[];
}
