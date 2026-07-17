export const Permissions = {
  OrganizationView: "organization.view",
  OrganizationUpdate: "organization.update",
  OrganizationMembersInvite: "organization.members.invite",
  OrganizationMembersRemove: "organization.members.remove",
  OrganizationRolesManage: "organization.roles.manage",
  EventsCreate: "events.create",
  EventsUpdate: "events.update",
  EventsPublish: "events.publish",
  EventsCancel: "events.cancel",
  EventsEdit: "events.edit",
  EventsDelete: "events.delete",
  EventsBan: "events.ban",
  OrdersView: "orders.view",
  AttendeesCheckin: "attendees.checkin",
  CouponsManage: "coupons.manage",
  AnnouncementsManage: "announcements.manage",
  AnalyticsView: "analytics.view",
  CategoriesManage: "categories.manage",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
