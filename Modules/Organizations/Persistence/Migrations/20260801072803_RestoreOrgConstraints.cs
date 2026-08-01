using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextEvent.Modules.Organizations.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RestoreOrgConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationMemberRoles_OrganizationMembers_OrganizationMemberId",
                schema: "org",
                table: "OrganizationMemberRoles");

            migrationBuilder.DropIndex(
                name: "IX_OrganizationRoles_OrganizationId",
                schema: "org",
                table: "OrganizationRoles");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "org",
                table: "Permissions",
                type: "varchar(120)",
                maxLength: 120,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                schema: "org",
                table: "Permissions",
                type: "varchar(120)",
                maxLength: 120,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                schema: "org",
                table: "Permissions",
                type: "varchar(80)",
                maxLength: 80,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "VerifiedAtUtc",
                schema: "org",
                table: "Organizations",
                type: "datetime2(3)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAtUtc",
                schema: "org",
                table: "Organizations",
                type: "datetime2(3)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                schema: "org",
                table: "Organizations",
                type: "varchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "pending_verification",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                schema: "org",
                table: "Organizations",
                type: "varchar(180)",
                maxLength: 180,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "org",
                table: "Organizations");

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                schema: "org",
                table: "Organizations",
                type: "rowversion",
                rowVersion: true,
                nullable: false);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "org",
                table: "Organizations",
                type: "varchar(160)",
                maxLength: 160,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                schema: "org",
                table: "Organizations",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DeletedAtUtc",
                schema: "org",
                table: "Organizations",
                type: "datetime2(3)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "org",
                table: "Organizations",
                type: "datetime2(3)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "ContactPhone",
                schema: "org",
                table: "Organizations",
                type: "varchar(40)",
                maxLength: 40,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ContactEmail",
                schema: "org",
                table: "Organizations",
                type: "varchar(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAtUtc",
                schema: "org",
                table: "OrganizationRoles",
                type: "datetime2(3)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "org",
                table: "OrganizationRoles",
                type: "varchar(80)",
                maxLength: 80,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<bool>(
                name: "IsSystemRole",
                schema: "org",
                table: "OrganizationRoles",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                schema: "org",
                table: "OrganizationRoles",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "org",
                table: "OrganizationRoles",
                type: "datetime2(3)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                schema: "org",
                table: "OrganizationMembers",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "JoinedAtUtc",
                schema: "org",
                table: "OrganizationMembers",
                type: "datetime2(3)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                schema: "org",
                table: "OrganizationMembers",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DeletedAtUtc",
                schema: "org",
                table: "OrganizationMembers",
                type: "datetime2(3)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "org",
                table: "OrganizationMembers",
                type: "datetime2(3)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.CreateIndex(
                name: "UX_Permissions_Code",
                schema: "org",
                table: "Permissions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_Status",
                schema: "org",
                table: "Organizations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "UX_Organizations_Slug",
                schema: "org",
                table: "Organizations",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_OrganizationRoles_OrganizationId_Name",
                schema: "org",
                table: "OrganizationRoles",
                columns: new[] { "OrganizationId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_OrganizationMembers_Active",
                schema: "org",
                table: "OrganizationMembers",
                columns: new[] { "OrganizationId", "UserId" },
                unique: true,
                filter: "[Status] = 1 AND [IsDeleted] = 0");

            migrationBuilder.AddForeignKey(
                name: "FK_OrganizationMemberRoles_OrganizationMembers_OrganizationMemberId",
                schema: "org",
                table: "OrganizationMemberRoles",
                column: "OrganizationMemberId",
                principalSchema: "org",
                principalTable: "OrganizationMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationMemberRoles_OrganizationMembers_OrganizationMemberId",
                schema: "org",
                table: "OrganizationMemberRoles");

            migrationBuilder.DropIndex(
                name: "UX_Permissions_Code",
                schema: "org",
                table: "Permissions");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_Status",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "UX_Organizations_Slug",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "UX_OrganizationRoles_OrganizationId_Name",
                schema: "org",
                table: "OrganizationRoles");

            migrationBuilder.DropIndex(
                name: "UX_OrganizationMembers_Active",
                schema: "org",
                table: "OrganizationMembers");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "org",
                table: "Permissions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(120)",
                oldMaxLength: 120);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                schema: "org",
                table: "Permissions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(120)",
                oldMaxLength: 120);

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                schema: "org",
                table: "Permissions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(80)",
                oldMaxLength: 80);

            migrationBuilder.AlterColumn<DateTime>(
                name: "VerifiedAtUtc",
                schema: "org",
                table: "Organizations",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAtUtc",
                schema: "org",
                table: "Organizations",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(30)",
                oldMaxLength: 30,
                oldDefaultValue: "pending_verification");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(180)",
                oldMaxLength: 180);

            migrationBuilder.DropColumn(
                name: "RowVersion",
                schema: "org",
                table: "Organizations");

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                schema: "org",
                table: "Organizations",
                type: "varbinary(max)",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(160)",
                oldMaxLength: 160);

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                schema: "org",
                table: "Organizations",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DeletedAtUtc",
                schema: "org",
                table: "Organizations",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "org",
                table: "Organizations",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)");

            migrationBuilder.AlterColumn<string>(
                name: "ContactPhone",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(40)",
                oldMaxLength: 40,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ContactEmail",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAtUtc",
                schema: "org",
                table: "OrganizationRoles",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "org",
                table: "OrganizationRoles",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(80)",
                oldMaxLength: 80);

            migrationBuilder.AlterColumn<bool>(
                name: "IsSystemRole",
                schema: "org",
                table: "OrganizationRoles",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                schema: "org",
                table: "OrganizationRoles",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "org",
                table: "OrganizationRoles",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                schema: "org",
                table: "OrganizationMembers",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<DateTime>(
                name: "JoinedAtUtc",
                schema: "org",
                table: "OrganizationMembers",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                schema: "org",
                table: "OrganizationMembers",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DeletedAtUtc",
                schema: "org",
                table: "OrganizationMembers",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "org",
                table: "OrganizationMembers",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2(3)");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationRoles_OrganizationId",
                schema: "org",
                table: "OrganizationRoles",
                column: "OrganizationId");

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
    }
}
