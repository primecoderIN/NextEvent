using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextEvent.Modules.Events.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixUserTableMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CategorySuggestions_User_ReviewedById",
                schema: "evt",
                table: "CategorySuggestions");

            migrationBuilder.DropForeignKey(
                name: "FK_CategorySuggestions_User_SuggestedById",
                schema: "evt",
                table: "CategorySuggestions");

            migrationBuilder.DropForeignKey(
                name: "FK_Organization_User_CreatedById",
                schema: "evt",
                table: "Organization");

            migrationBuilder.DropForeignKey(
                name: "FK_Organization_User_OwnerId",
                schema: "evt",
                table: "Organization");

            migrationBuilder.DropForeignKey(
                name: "FK_Organization_User_VerifiedById",
                schema: "evt",
                table: "Organization");

            migrationBuilder.AddForeignKey(
                name: "FK_CategorySuggestions_AspNetUsers_ReviewedById",
                schema: "evt",
                table: "CategorySuggestions",
                column: "ReviewedById",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CategorySuggestions_AspNetUsers_SuggestedById",
                schema: "evt",
                table: "CategorySuggestions",
                column: "SuggestedById",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CategorySuggestions_AspNetUsers_ReviewedById",
                schema: "evt",
                table: "CategorySuggestions");

            migrationBuilder.DropForeignKey(
                name: "FK_CategorySuggestions_AspNetUsers_SuggestedById",
                schema: "evt",
                table: "CategorySuggestions");

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
                name: "FK_CategorySuggestions_User_ReviewedById",
                schema: "evt",
                table: "CategorySuggestions",
                column: "ReviewedById",
                principalSchema: "evt",
                principalTable: "User",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CategorySuggestions_User_SuggestedById",
                schema: "evt",
                table: "CategorySuggestions",
                column: "SuggestedById",
                principalSchema: "evt",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Organization_User_CreatedById",
                schema: "evt",
                table: "Organization",
                column: "CreatedById",
                principalSchema: "evt",
                principalTable: "User",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Organization_User_OwnerId",
                schema: "evt",
                table: "Organization",
                column: "OwnerId",
                principalSchema: "evt",
                principalTable: "User",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Organization_User_VerifiedById",
                schema: "evt",
                table: "Organization",
                column: "VerifiedById",
                principalSchema: "evt",
                principalTable: "User",
                principalColumn: "Id");
        }
    }
}
