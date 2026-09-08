namespace Library.Api.Models
{
    public class User
    {
        public int ID { get; set; }
        public required string Name { get; set; }

        public List<Loan> Loans { get; set; } = new();
    }
}
