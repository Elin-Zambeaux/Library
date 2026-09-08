namespace Library.Api.Models
{
    public class Book
    {
        public int ID { get; set; }
        public required string Title { get; set; }
        public required string Author { get; set; }
        public List<Loan> Loans { get; set; } = new();
    }
}
