using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextEvent.Modules.Events.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEventsDateIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Events_Date",
                schema: "evt",
                table: "Events",
                column: "Date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Events_Date",
                schema: "evt",
                table: "Events");
        }
    }
}
