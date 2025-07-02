using DotnetAPIProject.Data;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace DotnetAPIProject.Services.Implementations
{
    public class DetailUserExamService : IDetailUserExamService
    {
        private readonly ApplicationDbContext _context;
        private readonly IQuestionService _questionService;

        public DetailUserExamService(ApplicationDbContext context, IQuestionService questionService)
        {
            _context = context;
            _questionService = questionService;
        }


        public async Task<bool> CheckListeningAnswerAsync(Guid answerId)
        {
            try
            {
                var answer = await _context.Answers.FindAsync(answerId);
                if (answer == null)
                    throw new Exception("Answer not found");
                return answer.IsCorrect;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<DetailUserExamDto> CreateDetailUserExamAsync(Guid userExamId, string status, DetailUserExamCreateDto createDto)
        {
            try
            {
                var detailUserExam = new DetailUserExam
                {
                    Id = Guid.NewGuid(),
                    IsMarked = createDto.IsMarked,
                    UserExamId = userExamId,
                    AnswerId = createDto.AnswerId,
                    QuestionId = createDto.QuestionId
                };

                await _context.DetailUserExams.AddAsync(detailUserExam);

                var isCorrect = new bool?();

                if (status.ToUpper() == "done".ToUpper())
                    isCorrect = null;
                else
                    isCorrect = await CheckListeningAnswerAsync(detailUserExam.AnswerId);

                var response = new DetailUserExamDto
                {
                    Id = detailUserExam.Id,
                    UserExamId = detailUserExam.UserExamId,
                    QuestionId = detailUserExam.QuestionId,
                    AnswerId = detailUserExam.AnswerId,
                    IsCorrect = await CheckListeningAnswerAsync(detailUserExam.AnswerId),
                    IsMarked = detailUserExam.IsMarked
                };

                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<DetailUserExamDto> UpdateDetailUserExamAsync(Guid userExamId, Guid questionId, DetailUserExamUpdateDto updateDto)
        {
            try
            {
                // Find the detail user exam by UserExamId and QuestionId
                var updateItem = await _context.DetailUserExams
                    .FirstOrDefaultAsync(d => d.UserExamId == userExamId && d.QuestionId == questionId);
                if (updateItem == null)
                    throw new Exception("DetailUserExam not found");

                // Update answer id and is marked in detail user exam
                updateItem.AnswerId = updateDto.AnswerId;
                updateItem.IsMarked = updateDto.IsMarked;

                await _context.SaveChangesAsync();

                var response = new DetailUserExamDto
                {
                    Id = updateItem.Id,
                    UserExamId = updateItem.UserExamId,
                    QuestionId = updateItem.QuestionId,
                    AnswerId = updateItem.AnswerId,
                    IsCorrect = await CheckListeningAnswerAsync(updateItem.AnswerId),
                    IsMarked = updateItem.IsMarked
                };

                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<List<DetailListeningUserExamResponseDto>> GetAllDetailUserExamByUserExamIdAsync(Guid userExamId)
        {
            try
            {
                var detailUserExams = await _context.DetailUserExams.Where(d => d.UserExamId == userExamId).ToListAsync();

                var response = new List<DetailListeningUserExamResponseDto>();

                foreach (var detailUserExam in detailUserExams)
                {
                    var questions = await _questionService.GetDetailListeningQuestionByIdAsync(detailUserExam.QuestionId);
                    if (questions == null)
                        throw new Exception("Question not found");

                    var newDetailUserExam = new DetailListeningUserExamResponseDto
                    {
                        Question = questions,
                        AnswerId = detailUserExam.AnswerId,
                        IsCorrect = await CheckListeningAnswerAsync(detailUserExam.AnswerId),
                        IsMarked = detailUserExam.IsMarked
                    };

                    response.Add(newDetailUserExam);
                }

                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        //Deleate all detail user exam by user exam id
        public async Task<bool> DeleteAllDetailUserExamByUserExamIdAsync(Guid userExamId)
        {
            try
            {
                var detailUserExams = await _context.DetailUserExams.Where(d => d.UserExamId == userExamId).ToListAsync();
                if (detailUserExams.Count == 0)
                    throw new Exception("No DetailUserExam found for this UserExam");

                _context.DetailUserExams.RemoveRange(detailUserExams);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}