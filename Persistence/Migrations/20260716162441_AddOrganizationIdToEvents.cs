using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationIdToEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Events",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_OrganizationId",
                table: "Events",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Organizations_OrganizationId",
                table: "Events",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_Organizations_OrganizationId",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_OrganizationId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Events");
        }
    }
}
