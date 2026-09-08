using System.Linq.Expressions;
using Microsoft.AspNetCore.Mvc;
using Library.Api.Models;
using Library.Api.Dtos;
using Library.Api.Data;

namespace Library.Api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly LibraryDbContext _context;

        public BooksController(LibraryDbContext context)
        {
            _context = context;
        }

        private static readonly Expression<Func<Book, BookDto>> ToBookDto =
            book => new BookDto(
                Id: book.ID,
                Title: book.Title,
                Author: book.Author,
                IsAvailable: book.Loans.All(loan => loan.ReturnedAt != null),
                BorrowedBy: book.Loans
                    .Where(loan => loan.ReturnedAt == null)
                    .Select(loan => loan.User == null ? null : loan.User.Name)
                    .FirstOrDefault());

        [HttpGet]
        public List<BookDto> GetAll()
        {
            return _context.Books
                .OrderBy(book => book.Title)
                .Select(ToBookDto)
                .ToList();
        }

        [HttpGet("{id:int}")]
        public ActionResult<BookDetailsDto> GetById(int id)
        {
            var bookDto = _context.Books
                .Where(candidate => candidate.ID == id)
                .Select(ToBookDto)
                .SingleOrDefault();

            if (bookDto is null)
            {
                return NotFound();
            }

            var BookDetails = new BookDetailsDto(
                bookDto.Id,
                bookDto.Title,
                bookDto.Author,
                bookDto.IsAvailable,
                bookDto.BorrowedBy,
                GetTimesLoaned(id),
                GetAverageDaysOnLoan(id),
                GetAlsoBorrowed(id));

            return BookDetails;
        }

        [HttpPost]
        public ActionResult<BookDto> Create(CreateBookRequest createRequest)
        {
            if (string.IsNullOrWhiteSpace(createRequest.Title) || string.IsNullOrWhiteSpace(createRequest.Author))
            {
                return BadRequest("A title and an author are required.");
            }

            var book = new Book
            {
                Title = createRequest.Title.Trim(),
                Author = createRequest.Author.Trim()
            };

            _context.Books.Add(book);
            _context.SaveChanges();

            var created = _context.Books
                .Where(saved => saved.ID == book.ID)
                .Select(ToBookDto)
                .Single();

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            var book = _context.Books.Find(id);
            if (book is null)
            {
                return NotFound();
            }

            if (_context.Loans.Any(loan => loan.BookId == id && loan.ReturnedAt == null))
            {
                return Conflict($"'{book.Title}' is on loan and cannot be removed.");
            }

            _context.Books.Remove(book);
            _context.SaveChanges();
            return NoContent();
        }

        private int GetTimesLoaned(int bookId)
        {
            return _context.Loans.Count(loan => loan.BookId == bookId);
        }

        private double? GetAverageDaysOnLoan(int bookId)
        {
            var completedLoans = _context.Loans
                .Where(loan => loan.BookId == bookId && loan.ReturnedAt != null)
                .Select(loan => new { loan.LoanedAt, Returned = loan.ReturnedAt!.Value })
                .ToList();

            return completedLoans.Count == 0
                ? null
                : completedLoans.Average(loan => (loan.Returned - loan.LoanedAt).TotalDays);
        }

        private List<RelatedBookDto> GetAlsoBorrowed(int bookId)
        {
            var activeBorrowerIds = _context.Loans
                .Where(loan => loan.BookId == bookId)
                .Select(loan => loan.UserId)
                .Distinct();

            var top3Related = _context.Loans
                .Where(loan => loan.BookId != bookId && activeBorrowerIds.Contains(loan.UserId))
                .Select(loan => new { loan.BookId, loan.UserId })
                .Distinct()
                .GroupBy(pair => pair.BookId)
                .Select(group => new { BookId = group.Key, SharedBorrowers = group.Count() })
                .OrderByDescending(row => row.SharedBorrowers)
                .Take(3)
                .ToList();

            var top3RelatedIds = top3Related.Select(row => row.BookId).ToList();

            var top3RelatedTitles = _context.Books
                .Where(candidate => top3RelatedIds.Contains(candidate.ID))
                .Select(candidate => new { candidate.ID, candidate.Title, candidate.Author })
                .ToList();

            return top3Related
                .Join(
                    top3RelatedTitles,
                    row => row.BookId,
                    title => title.ID,
                    (row, title) => new RelatedBookDto(
                        title.ID,
                        title.Title,
                        title.Author,
                        row.SharedBorrowers))
                .OrderByDescending(related => related.SharedBorrowers)
                .ThenBy(related => related.Title)
                .ToList();
        }
    }
}
