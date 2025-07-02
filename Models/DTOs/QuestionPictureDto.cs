namespace DotnetAPIProject.Models.DTOs
{
    public class QuestionPictureDto
    {
        public Guid QuestionID { get; set; }
        public string QuestionType { get; set; } // 1: Điền từ, 2: Chọn ảnh
        public string? TextQuestion { get; set; } // Câu hỏi cho cả loại 1 và 2
        public string? CorrectAnswer { get; set; } // Đáp án đúng cho loại 1
        public string? CorrectImg { get; set; } // Hình ảnh đúng cho loại 1
        public List<ImageOptionDto>? ImageOptions { get; set; } // Danh sách hình ảnh cho loại 2
    }

    public class ImageOptionDto
    {
        public string? QuestionImagesText { get; set; } // Mô tả hình ảnh
        public string? ImageCode { get; set; } // Mã hình ảnh
        public int IsCorrect { get; set; } // 1: Đúng, 0: Sai
    }
    public class CreateUserExamHistoryDto
    {
        public Guid UserId { get; set; }
        public Guid ExamId { get; set; }
    }
    // posst text
    public class PostQuestionTextRequestDto
    {
        public Guid ExamId { get; set; } // Đầu vào
        public string TextQuestion { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public string CorrectImg { get; set; } = string.Empty;
    }
    // post img
    public class PostQuestionImageRequestDto
    {
        public Guid ExamId { get; set; }
        public string QuestionImagesText { get; set; } = string.Empty;
        public string CorrectImg { get; set; } = string.Empty;
        public string WrongImg1 { get; set; } = string.Empty;
        public string WrongImg2 { get; set; } = string.Empty;
    }

}
