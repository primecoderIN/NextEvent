using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextEvent.Modules.Events.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEventSuspendAndReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSuspended",
                schema: "evt",
                table: "Events",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "EventReports",
                schema: "evt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReportedById = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventReports_Events_EventId",
                        column: x => x.EventId,
                        principalSchema: "evt",
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventReports_EventId",
                schema: "evt",
                table: "EventReports",
                column: "EventId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventReports",
                schema: "evt");

            migrationBuilder.DropColumn(
                name: "IsSuspended",
                schema: "evt",
                table: "Events");
        }
    }
}
