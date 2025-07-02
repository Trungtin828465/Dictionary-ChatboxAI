using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Data;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.parser;
using PdfEntity = DotnetAPIProject.Models.Entities.PdfDocument;
using Newtonsoft.Json;
using System.IO.Compression;
namespace DotNetAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PdfController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PdfController(ApplicationDbContext context)
        {
            _context = context;
        }
        private byte[] CompressData(byte[] data)
        {
            using (var outputStream = new MemoryStream())
            {
                using (var gzipStream = new GZipStream(outputStream, CompressionMode.Compress))
                {
                    gzipStream.Write(data, 0, data.Length);
                }
                return outputStream.ToArray();
            }
        }

        private byte[] DecompressData(byte[] compressedData)
        {
            using (var inputStream = new MemoryStream(compressedData))
            using (var gzipStream = new GZipStream(inputStream, CompressionMode.Decompress))
            using (var outputStream = new MemoryStream())
            {
                gzipStream.CopyTo(outputStream);
                return outputStream.ToArray();
            }
        }
        [HttpPost("upload-and-save")]
        public async Task<IActionResult> UploadAndSavePdf(IFormFile file, [FromQuery] Guid examId)
        {
            // Validate file input
            if (file == null || file.Length == 0)
                return BadRequest("Vui lòng tải lên một file PDF.");

            if (System.IO.Path.GetExtension(file.FileName).ToLower() != ".pdf")
                return BadRequest("Chỉ chấp nhận file PDF.");

            // Validate ExamId
            if (examId == Guid.Empty)
                return BadRequest("ExamId is required.");

            // Check if Exam exists
            var examExists = await _context.Exams.AnyAsync(e => e.Id == examId);
            if (!examExists)
                return BadRequest("Invalid ExamId. Exam does not exist.");

            try
            {
                using (var memoryStream = new MemoryStream())
                {
                    // Copy file to memory stream
                    await file.CopyToAsync(memoryStream);
                    var fileData = memoryStream.ToArray();
                    var compressedData = CompressData(fileData);

                    // Create PdfDocument entity
                    var pdfDocument = new PdfEntity
                    {
                        FileName = file.FileName,
                        FileData = compressedData,
                        UploadDate = DateTime.UtcNow, // Use UTC for consistency
                        FileSize = (int)file.Length,
                        ExamId = examId,
                        Content = null // Set Content to null as it's nullable and not used here
                    };

                    // Add to context and save
                    _context.PdfDocuments.Add(pdfDocument);
                    await _context.SaveChangesAsync();

                    // Return response
                    return Ok(new
                    {
                        Id = pdfDocument.Id,
                        FileName = pdfDocument.FileName,
                        FileSize = pdfDocument.FileSize,
                        UploadDate = pdfDocument.UploadDate,
                        ExamId = pdfDocument.ExamId
                    });
                }
            }
            catch (Exception ex)
            {
                // Log the exception (you might want to use a proper logging framework)
                Console.WriteLine($"Error processing PDF: {ex}");
                return StatusCode(500, $"Lỗi khi xử lý file: {ex.Message}");
            }
        }
        [HttpGet("proficiencies")]
        public async Task<IActionResult> GetProficiencies()
        {
            try
            {
                // Only include proficiencies that have at least one Reading exam
                var proficiencies = await _context.Proficiencies
                    .Where(p => p.Topics.Any(t => t.Exams.Any(e => e.Skill == "Reading")) && p.Skill=="Reading")
                    .Select(p => new { p.Id, p.Name, p.Band })
                    .ToListAsync();

                if (!proficiencies.Any())
                {
                    return NotFound("No proficiencies found with Reading exams.");
                }

                return Ok(proficiencies);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving proficiencies: {ex}");
                return StatusCode(500, $"Lỗi khi lấy danh sách band: {ex.Message}");
            }
        }
        [HttpGet("topics")]
        public async Task<IActionResult> GetTopics([FromQuery] Guid proficiencyId)
        {
            try
            {
                if (proficiencyId == Guid.Empty)
                {
                    return BadRequest("ProficiencyId is required.");
                }

                // Only include topics that have Reading exams
                var topics = await _context.Topics
                    .Where(t => t.ProficienciesId == proficiencyId && t.Exams.Any(e => e.Skill == "Reading"))
                    .Select(t => new { t.Id, t.Name, t.ProficienciesId })
                    .ToListAsync();

                if (!topics.Any())
                {
                    return NotFound($"No Reading topics found for proficiency ID {proficiencyId}.");
                }

                return Ok(topics);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving topics: {ex}");
                return StatusCode(500, $"Lỗi khi lấy danh sách chủ đề: {ex.Message}");
            }
        }
        [HttpGet("exams")]
        public async Task<IActionResult> GetExams([FromQuery] Guid topicId)
        {
            try
            {
                if (topicId == Guid.Empty)
                {
                    return BadRequest("TopicId is required.");
                }

                var exams = await _context.Exams
                    .Include(e => e.PdfDocuments) // Changed to PdfDocuments
                    .Where(e => e.TopicId == topicId && e.Skill == "Reading")
                    .Select(e => new
                    {
                        e.Id,
                        e.Name,
                        e.Time,
                        e.Skill,
                        PdfDocuments = e.PdfDocuments.Select(pdf => new
                        {
                            pdf.Id,
                            pdf.FileName,
                            pdf.UploadDate
                        })
                    })
                    .ToListAsync();

                if (!exams.Any())
                {
                    return NotFound($"No Reading exams found for topic ID {topicId}.");
                }

                return Ok(exams);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving exams: {ex}");
                return StatusCode(500, $"Lỗi khi lấy danh sách bài đọc: {ex.Message}");
            }
        }

        [HttpGet("exam/{id}")]
        public async Task<IActionResult> GetExamDetails(Guid id)
        {
            var exam = await _context.Exams
              .Include(e => e.PdfDocuments)
              .ThenInclude(pdf => pdf.AnswersReading)
              .FirstOrDefaultAsync(e => e.Id == id && e.Skill == "Reading");

            if (exam == null)
            {
                return NotFound($"No Reading exam found with ID {id}.");
            }

            var response = new
            {
                ExamId = exam.Id,
                ExamName = exam.Name,
                Time = exam.Time,
                PdfDocuments = exam.PdfDocuments.Select(pdf => new
                {
                    PdfId = pdf.Id, // Ensure this is included
                    FileName = pdf.FileName,
                    UploadDate = pdf.UploadDate,
                    FileData = Convert.ToBase64String(pdf.FileData ?? new byte[0]),
                    AnswersReadings = pdf.AnswersReading.Select(ar => new
                    {
                        TestId = ar.TestId,
                        TestTitle = ar.TestTitle,
                        CorrectAnswersJson = ar.CorrectAnswersJson,
                        CreatedDate = ar.CreatedDate
                    })
                })
            };

            return Ok(response);
        }
        [HttpGet("view/{id}")]
        public async Task<IActionResult> ViewPdf(int id)
        {

            // Fetch the PdfDocument with its related Exam
            var pdfDocument = await _context.PdfDocuments
                .Include(pdf => pdf.Exam) // Include the Exam to check the Skill
                .FirstOrDefaultAsync(pdf => pdf.Id == id);

                // Check if the PdfDocument exists and has FileData
                if (pdfDocument == null || pdfDocument.FileData == null)
                {
                    return NotFound($"Không tìm thấy tài liệu PDF với ID {id}.");
                }

                // Validate that the associated Exam has Skill = "Reading"
                if (pdfDocument.Exam == null || !pdfDocument.Exam.Skill.Equals("Reading", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest($"Tài liệu PDF với ID {id} không thuộc bài thi Reading.");
                }

            try
            {
                // Decompress the FileData
                var decompressedData = DecompressData(pdfDocument.FileData);

                // Check if the decompressed data is valid
                if (decompressedData == null || decompressedData.Length == 0)
                {
                    return StatusCode(500, "Dữ liệu giải nén không hợp lệ.");
                }

                // Return the decompressed data as a PDF file
                return File(decompressedData, "application/pdf");
            }
            catch (Exception ex)
            {
                // Log the exception (replace Console.WriteLine with a proper logging framework in production)
                Console.WriteLine($"Lỗi khi xử lý file cho ID {id}: {ex}");
                return StatusCode(500, $"Lỗi khi xử lý file: {ex.Message}");
            }
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<PdfEntity>> GetPdfMetadata(int id)
        {
            var pdfDocument = await _context.PdfDocuments.FindAsync(id);
            if (pdfDocument == null)
            {
                return NotFound();
            }
            return Ok(pdfDocument);
        }
    }
}
