using System.ComponentModel.DataAnnotations;
namespace DotnetAPIProject.Models.DTOs
{
    public class ListeningInforDto
    {
        public string Transcript { get; set; }
        public string AudioUrl { get; set; }
        public string ImageUrl { get; set; }
        public string Direction { get; set; }
    }

    public class ListeningInforreateDto
    {
        public required string Transcript { get; set; }
        public required string AudioUrl { get; set; }
        public string? ImageUrl { get; set; }
        public required string Direction { get; set; }
    }
}