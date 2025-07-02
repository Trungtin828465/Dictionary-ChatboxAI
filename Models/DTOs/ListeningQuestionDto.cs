using System.ComponentModel.DataAnnotations;
namespace DotnetAPIProject.Models.DTOs
{
    public class ListeningQuestionInforDto
    {
        public string? ImageUrl { get; set; }
        public string? DescriptionResult { get; set; }
    }

    public class ListeningQuestionInforCreateDto
    {
        public string? ImageUrl { get; set; }
        public string? DescriptionResult { get; set; }
    }
}