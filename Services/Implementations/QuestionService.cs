using DotnetAPIProject.Data;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DotnetAPIProject.Services.Implementations;

public class QuestionService : IQuestionService
{
    private readonly ApplicationDbContext _context;
    private readonly IAnswerService _answerService;
    private readonly IListeningQuestion _listeningQuestionService;

    public QuestionService(
        ApplicationDbContext context,
        IAnswerService answerService,
        IListeningQuestion listeningQuestionService)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _answerService = answerService ?? throw new ArgumentNullException(nameof(answerService));
        _listeningQuestionService = listeningQuestionService ?? throw new ArgumentNullException(nameof(listeningQuestionService));
    }

    public async Task<QuestionNoAnswerDto> CreateQuestionAsync(QuestionCreate createContent)
    {
        if (createContent == null)
            throw new ArgumentNullException(nameof(createContent));

        var newQuestion = new Question
        {
            Content = createContent.Content,
            ExamId = createContent.ExamId,
            TypeQuestion = createContent.TypeQuestion
        };

        _context.Questions.Add(newQuestion);
        await _context.SaveChangesAsync();

        var questionId = newQuestion.Id;

        // Create options for the new question
        var createdOptions = new List<AnswerResponseDto>();
        foreach (var option in createContent.Options)
        {
            try
            {
                await _answerService.CreateAnswerAsync(questionId, option);
            }
            catch (Exception ex)
            {
                // Optionally log the error
                throw new Exception($"Failed to create answer option: {ex.Message}", ex);
            }
        }

        // Get the options for the new question
        var options = await _answerService.GetAnswersByQuestionIdAsync(questionId);
        if (options == null)
            throw new Exception("Insert failed: Could not retrieve created options.");

        return new QuestionNoAnswerDto
        {
            Id = newQuestion.Id,
            Content = newQuestion.Content,
            TypeQuestion = newQuestion.TypeQuestion
        };
    }

    public async Task<IEnumerable<QuestionNoAnswerDto>> GetAllQuestionsByExamIdAsync(Guid examId)
    {
        var questions = await _context.Questions
            .Where(q => q.ExamId == examId)
            .ToListAsync();

        var questionDtos = new List<QuestionNoAnswerDto>();

        foreach (var question in questions)
        {
            questionDtos.Add(new QuestionNoAnswerDto
            {
                Id = question.Id,
                Content = question.Content,
                TypeQuestion = question.TypeQuestion
            });
        }

        return questionDtos;
    }

    public async Task<ListeningQuestionResponseDto> CreateListeningQuestionAsync(ListeningQuestionCreate createContent)
    {
        try{
            if (createContent == null)
                throw new ArgumentNullException(nameof(createContent));

            var question = new QuestionCreate
            {
                Content = createContent.Content,
                TypeQuestion = createContent.TypeQuestion,
                ExamId = createContent.ExamId,
                Options = createContent.Options
            };
            // create question
            var newQuestion = await CreateQuestionAsync(question);

            // create listening question
            var newListeningQuestion = await _listeningQuestionService.CreateListeningQuestionAsync(newQuestion.Id, createContent.Infor);

            // get options by question id
            var options = await _answerService.GetAnswersByQuestionIdAsync(newQuestion.Id);

            return new ListeningQuestionResponseDto
            {
                Id = newQuestion.Id,
                Content = newQuestion.Content,
                TypeQuestion = newQuestion.TypeQuestion,
                Infor = newListeningQuestion,
                Options = options
            };
        }
        catch(Exception ex){
            throw new Exception(ex.Message);
        }
    }

    public async Task<List<ListeningQuestionResponseDto>> GetAllListeningQuestionsByExamIdAsync(Guid examId)
    {
        try
        {
            var questions = await _context.Questions
                .Where(q => q.ExamId == examId)
                .ToListAsync();

            var result = new List<ListeningQuestionResponseDto>();

            foreach (var question in questions)
            {
                var listeningQuestionInfo = await _context.ListeningQuestions.FirstOrDefaultAsync(lq => lq.QuestionId == question.Id);
                var options = await _answerService.GetAnswersByQuestionIdAsync(question.Id);

                result.Add(new ListeningQuestionResponseDto
                {
                    Id = question.Id,
                    Content = question.Content,
                    TypeQuestion = question.TypeQuestion,
                    Infor = new ListeningQuestionInforDto
                    {
                        ImageUrl = listeningQuestionInfo?.ImageUrl,
                        DescriptionResult = listeningQuestionInfo?.DescriptionResult ?? string.Empty
                    },
                    Options = options
                });
            }

            return result;
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task<QuestionHaveAnswerDto> GetQuestionByIdAsync(Guid id)
    {
       try{
            var question = await _context.Questions.FindAsync(id);
            if (question == null)
                throw new Exception("Question not found");

            var options = await _answerService.GetAnswersByQuestionIdAsync(id);

            return new QuestionHaveAnswerDto
            {
                Id = question.Id,
                Content = question.Content,
                TypeQuestion = question.TypeQuestion,
                Options = options
            };
       }
       catch(Exception ex){
        throw new Exception(ex.Message);
       }
    }

    public async Task<ListeningQuestionResponseDto> GetDetailListeningQuestionByIdAsync(Guid id)
    {
        try{
            var question = await _context.Questions.FindAsync(id);
            if (question == null)
                throw new Exception("Question not found");

            var listeningQuestionInfo = await _context.ListeningQuestions.FirstOrDefaultAsync(lq => lq.QuestionId == id);
            var options = await _answerService.GetAnswersByQuestionIdAsync(id, includeCorrect: true);
            

            var response = new ListeningQuestionResponseDto
            {
                Id = question.Id,
                Content = question.Content,
                TypeQuestion = question.TypeQuestion,
                Infor = new ListeningQuestionInforDto
                {
                    ImageUrl = listeningQuestionInfo.ImageUrl ?? string.Empty,
                    DescriptionResult = listeningQuestionInfo.DescriptionResult ?? string.Empty
                },
                Options = options
            };

            return response;
        }
        catch(Exception ex){
            throw new Exception(ex.Message);
        }
    }
}