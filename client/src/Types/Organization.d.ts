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
