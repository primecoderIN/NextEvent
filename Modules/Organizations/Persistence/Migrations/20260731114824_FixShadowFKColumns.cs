using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextEvent.Modules.Organizations.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixShadowFKColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationRoles_AspNetUsers_CreatedByUserId",
                schema: "org",
                table: "OrganizationRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationRoles_AspNetUsers_UpdatedByUserId",
                schema: "org",
                table: "OrganizationRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_Organizations_AspNetUsers_CreatedById",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropForeignKey(
                name: "FK_Organizations_AspNetUsers_OwnerId",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropForeignKey(
                name: "FK_Organizations_AspNetUsers_VerifiedById",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_CreatedById",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_OwnerId",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_VerifiedById",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "VerifiedById",
                schema: "org",
                table: "Organizations");

            migrationBuilder.AlterColumn<string>(
                name: "VerifiedByUserId",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OwnerUserId",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "CreatedByUserId",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_CreatedByUserId",
                schema: "org",
                table: "Organizations",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_OwnerUserId",
                schema: "org",
                table: "Organizations",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_VerifiedByUserId",
                schema: "org",
                table: "Organizations",
                column: "VerifiedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrganizationRoles_CreatedBy_UserId",
                schema: "org",
                table: "OrganizationRoles",
                column: "CreatedByUserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrganizationRoles_UpdatedBy_UserId",
                schema: "org",
                table: "OrganizationRoles",
                column: "UpdatedByUserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Organizations_CreatedBy_UserId",
                schema: "org",
                table: "Organizations",
                column: "CreatedByUserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Organizations_Owner_UserId",
                schema: "org",
                table: "Organizations",
                column: "OwnerUserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Organizations_VerifiedBy_UserId",
                schema: "org",
                table: "Organizations",
                column: "VerifiedByUserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationRoles_CreatedBy_UserId",
                schema: "org",
                table: "OrganizationRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_OrganizationRoles_UpdatedBy_UserId",
                schema: "org",
                table: "OrganizationRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_Organizations_CreatedBy_UserId",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropForeignKey(
                name: "FK_Organizations_Owner_UserId",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropForeignKey(
                name: "FK_Organizations_VerifiedBy_UserId",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_CreatedByUserId",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_OwnerUserId",
                schema: "org",
                table: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Organizations_VerifiedByUserId",
                schema: "org",
                table: "Organizations");

            migrationBuilder.AlterColumn<string>(
                name: "VerifiedByUserId",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OwnerUserId",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "CreatedByUserId",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "CreatedById",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OwnerId",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VerifiedById",
                schema: "org",
                table: "Organizations",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_CreatedById",
                schema: "org",
                table: "Organizations",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_OwnerId",
                schema: "org",
                table: "Organizations",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_VerifiedById",
                schema: "org",
                table: "Organizations",
                column: "VerifiedById");

            migrationBuilder.AddForeignKey(
                name: "FK_OrganizationRoles_AspNetUsers_CreatedByUserId",
                schema: "org",
                table: "OrganizationRoles",
                column: "CreatedByUserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OrganizationRoles_AspNetUsers_UpdatedByUserId",
                schema: "org",
                table: "OrganizationRoles",
                column: "UpdatedByUserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Organizations_AspNetUsers_CreatedById",
                schema: "org",
                table: "Organizations",
                column: "CreatedById",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Organizations_AspNetUsers_OwnerId",
                schema: "org",
                table: "Organizations",
                column: "OwnerId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Organizations_AspNetUsers_VerifiedById",
                schema: "org",
                table: "Organizations",
                column: "VerifiedById",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
