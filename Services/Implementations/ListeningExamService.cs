using DotnetAPIProject.Data;
using DotnetAPIProject.Models.DTOs;
using DotnetAPIProject.Models.Entities;
using DotnetAPIProject.Services.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace DotnetAPIProject.Services.Implementations
{
    public class ListeningExamService : IListeningExamService
    {
        private readonly ApplicationDbContext _context;
    

        public ListeningExamService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ListeningInforDto> CreateListeningExamInforAsync(Guid examId, ListeningInforreateDto listeningExamDto)
        {
            try{
                var listeningInfor = new ListeningExam
                {
                    Id = Guid.NewGuid(),
                    Transcript = listeningExamDto.Transcript,
                    AudioUrl = listeningExamDto.AudioUrl,
                    ImageUrl = listeningExamDto.ImageUrl ?? string.Empty,
                    Direction = listeningExamDto.Direction,
                    ExamId = examId,
                };

                var result =_context.ListeningExams.Add(listeningInfor);
                await _context.SaveChangesAsync();

                if (result == null)
                {
                    throw new Exception("Create listening exam infor failed");
                }

                var listeningInforDto = new ListeningInforDto
                {
                    Transcript = listeningInfor.Transcript,
                    AudioUrl = listeningInfor.AudioUrl,
                    ImageUrl = listeningInfor.ImageUrl,
                    Direction = listeningInfor.Direction,
                };

                return listeningInforDto;
            }
            catch(Exception ex){
                throw new Exception(ex.Message);
            }
        }
    }
}