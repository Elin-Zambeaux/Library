using System.Linq.Expressions;
using Microsoft.AspNetCore.Mvc;
using Library.Api.Models;
using Library.Api.Dtos;
using Library.Api.Data;

namespace Library.Api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class LoansController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        public LoansController(LibraryDbContext context)
        {
            _context = context;
        }


        private static readonly Expression<Func<Loan, LoanDto>> ToLoanDto =
            loan => new LoanDto(
                loan.ID,
                loan.BookId,
                loan.Book!.Title,
                loan.Book!.Author,
                loan.UserId,
                loan.User!.Name,
                loan.LoanedAt,
                loan.ReturnedAt);

        [HttpGet]
        public List<LoanDto> GetAll([FromQuery] int? userId)
        {
            var loans = _context.Loans.AsQueryable();

            if (userId is not null)
            {
                loans = loans.Where(loan => loan.UserId == userId);
            }

            return loans
                .OrderByDescending(loan => loan.LoanedAt)
                .Select(ToLoanDto)
                .ToList();
        }

        [HttpPost]
        public ActionResult<LoanDto> Create(CreateLoanRequest createLoanRequest)
        {
            var book = _context.Books.Find(createLoanRequest.BookId);
            if (book is null)
            {
                return NotFound($"No book with id {createLoanRequest.BookId}.");
            }

            var user = _context.Users.Find(createLoanRequest.UserId);
            if (user is null)
            {
                return NotFound($"No user with id {createLoanRequest.UserId}.");
            }

            if (_context.Loans.Any(loan => loan.BookId == book.ID && loan.ReturnedAt == null))
            {
                return Conflict($"'{book.Title}' is already on loan.");
            }

            var loan = new Loan
            {
                BookId = book.ID,
                UserId = user.ID,
                LoanedAt = DateTime.UtcNow
            };

            _context.Loans.Add(loan);
            _context.SaveChanges();

            return GetLoanDto(loan.ID);
        }

        [HttpPost("{id}/return")]
        public ActionResult<LoanDto> ReturnLoan(int id)
        {
            var loan = _context.Loans.Find(id);
            if (loan is null)
            {
                return NotFound();
            }

            if (loan.ReturnedAt is not null)
            {
                return Conflict("The loan has already been returned.");
            }

            loan.ReturnedAt = DateTime.UtcNow;
            _context.SaveChanges();

            return GetLoanDto(loan.ID);
        }

        private LoanDto GetLoanDto(int loanId)
        {
            return _context.Loans
                .Where(loan => loan.ID == loanId)
                .Select(ToLoanDto)
                .Single();
        }
    }
}
