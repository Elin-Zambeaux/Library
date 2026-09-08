namespace Library.Api.Models
{
    public class Loan
    {
        public int ID { get; set; }
        public int BookId { get; set; }
        public Book? Book { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }

        public DateTime LoanedAt { get; set; } = DateTime.UtcNow;

        // Null while the book is still out; set when it comes back.
        public DateTime? ReturnedAt { get; set; }
    }
}
