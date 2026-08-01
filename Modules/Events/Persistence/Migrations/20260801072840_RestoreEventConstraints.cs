using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextEvent.Modules.Events.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RestoreEventConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
                name: "FK_CategorySuggestions_Categories_ApprovedCategoryId",
                schema: "evt",
                table: "CategorySuggestions");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_Categories_CategoryId",
                schema: "evt",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_Organization_OrganizationId",
                schema: "evt",
                table: "Events");

            migrationBuilder.AlterColumn<string>(
                name: "TimeZoneId",
                schema: "evt",
                table: "Events",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "UTC",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "evt",
                table: "Events",
                type: "datetime2(3)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAtUtc",
                schema: "evt",
                table: "CategorySuggestions",
                type: "datetime2(3)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                schema: "evt",
                table: "CategorySuggestions",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                schema: "evt",
                table: "CategorySuggestions",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ReviewedAt",
                schema: "evt",
                table: "CategorySuggestions",
                type: "datetime2(3)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "evt",
                table: "CategorySuggestions",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "evt",
                table: "CategorySuggestions",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "evt",
                table: "CategorySuggestions",
                type: "datetime2(3)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAtUtc",
                schema: "evt",
                table: "Categories",
                type: "datetime2(3)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<int>(
                name: "SortOrder",
                schema: "evt",
                table: "Categories",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                schema: "evt",
                table: "Categories",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "evt",
                table: "Categories",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                schema: "evt",
                table: "Categories",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "evt",
                table: "Categories",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "evt",
                table: "Categories",
                type: "datetime2(3)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.CreateIndex(
                name: "IX_CategorySuggestions_Status",
                schema: "evt",
                table: "CategorySuggestions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Slug",
                schema: "evt",
                table: "Categories",
                column: "Slug",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CategorySuggestions_AspNetUsers_ReviewedById",
                schema: "evt",
                table: "CategorySuggestions",
                column: "ReviewedById",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CategorySuggestions_AspNetUsers_SuggestedById",
                schema: "evt",
                table: "CategorySuggestions",
                column: "SuggestedById",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CategorySuggestions_Categories_ApprovedCategoryId",
                schema: "evt",
                table: "CategorySuggestions",
                column: "ApprovedCategoryId",
                principalSchema: "evt",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Categories_CategoryId",
                schema: "evt",
                table: "Events",
                column: "CategoryId",
                principalSchema: "evt",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Organization_OrganizationId",
                schema: "evt",
                table: "Events",
                column: "OrganizationId",
                principalSchema: "evt",
                principalTable: "Organization",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
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
                name: "FK_CategorySuggestions_Categories_ApprovedCategoryId",
                schema: "evt",
                table: "CategorySuggestions");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_Categories_CategoryId",
                schema: "evt",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_Organization_OrganizationId",
                schema: "evt",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_CategorySuggestions_Status",
                schema: "evt",
                table: "CategorySuggestions");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Slug",
                schema: "evt",
                table: "Categories");

            migrationBuilder.AlterColumn<string>(
                name: "TimeZoneId",
                schema: "evt",
                table: "Events",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(50)",
                oldMaxLength: 50,
                oldDefaultValue: "UTC");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                schema: "evt",
                table: "Events",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAtUtc",
                schema: "evt",
                table: "CategorySuggestions",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                schema: "evt",
                table: "CategorySuggestions",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                schema: "evt",
                table: "CategorySuggestions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ReviewedAt",
                schema: "evt",
                table: "CategorySuggestions",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "evt",
                table: "CategorySuggestions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "evt",
                table: "CategorySuggestions",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "evt",
                table: "CategorySuggestions",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAtUtc",
                schema: "evt",
                table: "Categories",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)");

            migrationBuilder.AlterColumn<int>(
                name: "SortOrder",
                schema: "evt",
                table: "Categories",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                schema: "evt",
                table: "Categories",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "evt",
                table: "Categories",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                schema: "evt",
                table: "Categories",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "evt",
                table: "Categories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "evt",
                table: "Categories",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)");

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
                name: "FK_CategorySuggestions_Categories_ApprovedCategoryId",
                schema: "evt",
                table: "CategorySuggestions",
                column: "ApprovedCategoryId",
                principalSchema: "evt",
                principalTable: "Categories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Categories_CategoryId",
                schema: "evt",
                table: "Events",
                column: "CategoryId",
                principalSchema: "evt",
                principalTable: "Categories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Organization_OrganizationId",
                schema: "evt",
                table: "Events",
                column: "OrganizationId",
                principalSchema: "evt",
                principalTable: "Organization",
                principalColumn: "Id");
        }
    }
}
