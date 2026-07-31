using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextEvent.Modules.Organizations.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixOrgMemberFKColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationMembers_AspNetUsers_CreatedByUserId",
                schema: "org",
                table: "OrganizationMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationMembers_AspNetUsers_UserId",
                schema: "org",
                table: "OrganizationMembers");

            migrationBuilder.AddForeignKey(
                name: "FK_OrganizationMembers_CreatedBy_UserId",
                schema: "org",
                table: "OrganizationMembers",
                column: "CreatedByUserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrganizationMembers_User_UserId",
                schema: "org",
                table: "OrganizationMembers",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationMembers_CreatedBy_UserId",
                schema: "org",
                table: "OrganizationMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationMembers_User_UserId",
                schema: "org",
                table: "OrganizationMembers");

            migrationBuilder.AddForeignKey(
                name: "FK_OrganizationMembers_AspNetUsers_CreatedByUserId",
                schema: "org",
                table: "OrganizationMembers",
                column: "CreatedByUserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrganizationMembers_AspNetUsers_UserId",
                schema: "org",
                table: "OrganizationMembers",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
