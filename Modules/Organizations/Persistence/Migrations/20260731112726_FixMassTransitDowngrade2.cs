using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextEvent.Modules.Organizations.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixMassTransitDowngrade2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationMemberRoles_OrganizationMembers_OrganizationMemberId",
                schema: "org",
                table: "OrganizationMemberRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationMemberRoles_OrganizationRoles_OrganizationRoleId1",
                schema: "org",
                table: "OrganizationMemberRoles");

            migrationBuilder.DropIndex(
                name: "IX_OrganizationMemberRoles_OrganizationRoleId1",
                schema: "org",
                table: "OrganizationMemberRoles");

            migrationBuilder.DropColumn(
                name: "OrganizationRoleId1",
                schema: "org",
                table: "OrganizationMemberRoles");

            migrationBuilder.AddForeignKey(
                name: "FK_OrganizationMemberRoles_OrganizationMembers_OrganizationMemberId",
                schema: "org",
                table: "OrganizationMemberRoles",
                column: "OrganizationMemberId",
                principalSchema: "org",
                principalTable: "OrganizationMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationMemberRoles_OrganizationMembers_OrganizationMemberId",
                schema: "org",
                table: "OrganizationMemberRoles");

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationRoleId1",
                schema: "org",
                table: "OrganizationMemberRoles",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMemberRoles_OrganizationRoleId1",
                schema: "org",
                table: "OrganizationMemberRoles",
                column: "OrganizationRoleId1");

            migrationBuilder.AddForeignKey(
                name: "FK_OrganizationMemberRoles_OrganizationMembers_OrganizationMemberId",
                schema: "org",
                table: "OrganizationMemberRoles",
                column: "OrganizationMemberId",
                principalSchema: "org",
                principalTable: "OrganizationMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OrganizationMemberRoles_OrganizationRoles_OrganizationRoleId1",
                schema: "org",
                table: "OrganizationMemberRoles",
                column: "OrganizationRoleId1",
                principalSchema: "org",
                principalTable: "OrganizationRoles",
                principalColumn: "Id");
        }
    }
}
