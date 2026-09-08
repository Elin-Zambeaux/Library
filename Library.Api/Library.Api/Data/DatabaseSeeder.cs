using Library.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Library.Api.Data
{
    // Fills an empty database with sample data. The loans are hand-picked rather
    // than random: the book details page ranks "also borrowed" by how many
    // people took out both books, so the reading lists below deliberately
    // overlap. Random loans would mostly produce no overlap at all.
    public static class DatabaseSeeder
    {
        private static readonly (string Title, string Author)[] Catalogue =
        {
            ("Kallocain", "Karin Boye"),
            ("The Dispossessed", "Ursula K. Le Guin"),
            ("A Wizard of Earthsea", "Ursula K. Le Guin"),
            ("The Left Hand of Darkness", "Ursula K. Le Guin"),
            ("Odysseus", "Homeros"),
            ("My Brilliant Friend", "Elena Ferrante"),
            ("The Story of a New Name", "Elena Ferrante"),
            ("Never Let Me Go", "Kazuo Ishiguro"),
            ("The Remains of the Day", "Kazuo Ishiguro"),
            ("Klara and the Sun", "Kazuo Ishiguro"),
            ("Beloved", "Toni Morrison"),
            ("Song of Solomon", "Toni Morrison"),
            ("Pippi Longstocking", "Astrid Lindgren"),
            ("Ronia, the Robber's Daughter", "Astrid Lindgren"),
            ("The Emigrants", "Vilhelm Moberg"),
            ("Doctor Glas", "Hjalmar Soderberg"),
            ("The Master and Margarita", "Mikhail Bulgakov"),
            ("Solaris", "Stanislaw Lem"),
            ("The Wall", "Marlen Haushofer"),
            ("Piranesi", "Susanna Clarke"),
        };

        // StillOut is each reader's one unreturned book. They are all different
        // titles, because a book can only be on loan to one person at a time.
        private static readonly (string Name, string[] Returned, string? StillOut)[] ReadingLists =
        {
            ("Elin", new[]
            {
                "The Dispossessed", "A Wizard of Earthsea",
                "The Left Hand of Darkness", "Solaris", "Piranesi"
            }, "Kallocain"),

            ("Johan", new[]
            {
                "The Dispossessed", "A Wizard of Earthsea",
                "Solaris", "The Master and Margarita"
            }, "The Wall"),

            ("Maja", new[]
            {
                "My Brilliant Friend", "The Story of a New Name",
                "Never Let Me Go", "Piranesi"
            }, "Beloved"),

            ("Oskar", new[]
            {
                "Never Let Me Go", "The Remains of the Day",
                "Klara and the Sun", "Solaris"
            }, "Odysseus"),

            ("Sara", new[]
            {
                "Beloved", "Song of Solomon",
                "My Brilliant Friend", "Pippi Longstocking"
            }, "The Emigrants"),

            ("Nils", new[]
            {
                "Pippi Longstocking", "Ronia, the Robber's Daughter",
                "Doctor Glas", "The Left Hand of Darkness"
            }, null),
        };

        public static void Seed(LibraryDbContext context)
        {
            // Creates the database and applies any missing migrations, so wiping
            // library.db and starting the app is enough to get back to this state.
            context.Database.Migrate();

            if (context.Books.Any())
            {
                return;
            }

            var books = Catalogue
                .Select(entry => new Book { Title = entry.Title, Author = entry.Author })
                .ToList();

            var users = ReadingLists
                .Select(list => new User { Name = list.Name })
                .ToList();

            context.Books.AddRange(books);
            context.Users.AddRange(users);

            // Saving first so every book and user has a real ID to point loans at.
            context.SaveChanges();

            var bookByTitle = books.ToDictionary(book => book.Title);
            var userByName = users.ToDictionary(user => user.Name);

            var loans = new List<Loan>();

            // Fixed start date and a fixed step, so the seeded statistics come
            // out the same every time instead of drifting with the clock.
            var firstLoan = new DateTime(2026, 1, 6, 10, 0, 0, DateTimeKind.Utc);
            var slot = 0;

            foreach (var list in ReadingLists)
            {
                foreach (var title in list.Returned)
                {
                    var loanedAt = firstLoan.AddDays(slot * 9);
                    var daysOut = 4 + (slot % 5) * 3;

                    loans.Add(new Loan
                    {
                        BookId = bookByTitle[title].ID,
                        UserId = userByName[list.Name].ID,
                        LoanedAt = loanedAt,
                        ReturnedAt = loanedAt.AddDays(daysOut),
                    });

                    slot++;
                }
            }

            var stillOut = 0;

            foreach (var list in ReadingLists)
            {
                if (list.StillOut is null)
                {
                    continue;
                }

                loans.Add(new Loan
                {
                    BookId = bookByTitle[list.StillOut].ID,
                    UserId = userByName[list.Name].ID,
                    LoanedAt = DateTime.UtcNow.AddDays(-(3 + stillOut * 2)),
                    ReturnedAt = null,
                });

                stillOut++;
            }

            context.Loans.AddRange(loans);
            context.SaveChanges();
        }
    }
}
