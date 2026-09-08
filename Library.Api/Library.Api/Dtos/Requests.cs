namespace Library.Api.Dtos
{
    public record CreateBookRequest(string? Title, string? Author);

    public record CreateUserRequest(string? Name);

    public record CreateLoanRequest(int BookId, int UserId);
}
