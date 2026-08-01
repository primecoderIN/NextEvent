using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextEvent.Modules.Events.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEventsModelSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_Organization_OrganizationId",
                schema: "evt",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_Organization_AspNetUsers_CreatedById",
                schema: "evt",
                table: "Organization");

            migrationBuilder.DropForeignKey(
                name: "FK_Organization_AspNetUsers_OwnerId",
                schema: "evt",
                table: "Organization");

            migrationBuilder.DropForeignKey(
                name: "FK_Organization_AspNetUsers_VerifiedById",
                schema: "evt",
                table: "Organization");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Organizations_OrganizationId",
                schema: "evt",
                table: "Events",
                column: "OrganizationId",
                principalSchema: "org",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_Organizations_OrganizationId",
                schema: "evt",
                table: "Events");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Organization_OrganizationId",
                schema: "evt",
                table: "Events",
                column: "OrganizationId",
                principalSchema: "evt",
                principalTable: "Organization",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Organization_AspNetUsers_CreatedById",
                schema: "evt",
                table: "Organization",
                column: "CreatedById",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Organization_AspNetUsers_OwnerId",
                schema: "evt",
                table: "Organization",
                column: "OwnerId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Organization_AspNetUsers_VerifiedById",
                schema: "evt",
                table: "Organization",
                column: "VerifiedById",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
