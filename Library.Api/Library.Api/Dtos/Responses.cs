namespace Library.Api.Dtos
{
    public record BookDto(
        int Id,
        string Title,
        string Author,
        bool IsAvailable,
        string? BorrowedBy);

    public record UserDto(int Id, string Name);

    // Number of users that have borrowed the same book
    public record RelatedBookDto(int Id, string Title, string Author, int SharedBorrowers);

    // Book details, including statistics from previous loans
    public record BookDetailsDto(
        int Id,
        string Title,
        string Author,
        bool IsAvailable,
        string? BorrowedBy,
        int NumberOfTimesLoaned,
        double? AverageDaysOnLoan,
        List<RelatedBookDto> AlsoBorrowed);

    public record LoanDto(
        int Id,
        int BookId,
        string BookTitle,
        string BookAuthor,
        int UserId,
        string UserName,
        DateTime LoanedAt,
        DateTime? ReturnedAt);
}
