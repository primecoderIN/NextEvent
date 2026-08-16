using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextEvent.Modules.Events.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEventReportUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EventReports_EventId",
                schema: "evt",
                table: "EventReports");

            migrationBuilder.CreateIndex(
                name: "UX_EventReports_Event_Reporter",
                schema: "evt",
                table: "EventReports",
                columns: new[] { "EventId", "ReportedById" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_EventReports_Event_Reporter",
                schema: "evt",
                table: "EventReports");

            migrationBuilder.CreateIndex(
                name: "IX_EventReports_EventId",
                schema: "evt",
                table: "EventReports",
                column: "EventId");
        }
    }
}
