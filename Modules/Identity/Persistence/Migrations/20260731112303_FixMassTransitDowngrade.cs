using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextEvent.Modules.Identity.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixMassTransitDowngrade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OutboxMessage_InboxState_InboxMessageId_InboxConsumerId",
                schema: "identity",
                table: "OutboxMessage");

            migrationBuilder.DropForeignKey(
                name: "FK_OutboxMessage_OutboxState_OutboxId",
                schema: "identity",
                table: "OutboxMessage");

            migrationBuilder.DropIndex(
                name: "IX_OutboxState_BusName_Created",
                schema: "identity",
                table: "OutboxState");

            migrationBuilder.DropColumn(
                name: "BusName",
                schema: "identity",
                table: "OutboxState");

            migrationBuilder.CreateIndex(
                name: "IX_OutboxState_Created",
                schema: "identity",
                table: "OutboxState",
                column: "Created");

            migrationBuilder.CreateIndex(
                name: "IX_OutboxMessage_EnqueueTime",
                schema: "identity",
                table: "OutboxMessage",
                column: "EnqueueTime");

            migrationBuilder.CreateIndex(
                name: "IX_OutboxMessage_ExpirationTime",
                schema: "identity",
                table: "OutboxMessage",
                column: "ExpirationTime");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OutboxState_Created",
                schema: "identity",
                table: "OutboxState");

            migrationBuilder.DropIndex(
                name: "IX_OutboxMessage_EnqueueTime",
                schema: "identity",
                table: "OutboxMessage");

            migrationBuilder.DropIndex(
                name: "IX_OutboxMessage_ExpirationTime",
                schema: "identity",
                table: "OutboxMessage");

            migrationBuilder.AddColumn<string>(
                name: "BusName",
                schema: "identity",
                table: "OutboxState",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OutboxState_BusName_Created",
                schema: "identity",
                table: "OutboxState",
                columns: new[] { "BusName", "Created" });

            migrationBuilder.AddForeignKey(
                name: "FK_OutboxMessage_InboxState_InboxMessageId_InboxConsumerId",
                schema: "identity",
                table: "OutboxMessage",
                columns: new[] { "InboxMessageId", "InboxConsumerId" },
                principalSchema: "identity",
                principalTable: "InboxState",
                principalColumns: new[] { "MessageId", "ConsumerId" });

            migrationBuilder.AddForeignKey(
                name: "FK_OutboxMessage_OutboxState_OutboxId",
                schema: "identity",
                table: "OutboxMessage",
                column: "OutboxId",
                principalSchema: "identity",
                principalTable: "OutboxState",
                principalColumn: "OutboxId");
        }
    }
}
