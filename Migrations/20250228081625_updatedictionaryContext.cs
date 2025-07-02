using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DotnetAPIProject.Migrations
{
    /// <inheritdoc />
    public partial class updatedictionaryContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "meaning",
                table: "DictionaryItems",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "pronunciation",
                table: "DictionaryItems",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "type",
                table: "DictionaryItems",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "meaning",
                table: "DictionaryItems");

            migrationBuilder.DropColumn(
                name: "pronunciation",
                table: "DictionaryItems");

            migrationBuilder.DropColumn(
                name: "type",
                table: "DictionaryItems");
        }
    }
}
