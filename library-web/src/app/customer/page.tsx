import Link from "next/link";
import { getBooks, getLoans } from "../lib/api";
import { BookCard } from "../components/BookCard";
import { LoanCard } from "../components/LoanCard";

const MAX_BOOKS_SHOWN = 60;

export default async function CustomerPage(props: PageProps<"/customer">) {
    const { name, q } = await props.searchParams;
    const borrower = typeof name === "string" ? name.trim() : "";
    const query = typeof q === "string" ? q : "";
    const search = query.trim().toLowerCase();

    const [books, loans] = await Promise.all([getBooks(), getLoans()]);

    const matched = books.filter(
        (book) =>
            search === "" ||
            book.title.toLowerCase().includes(search) ||
            book.author.toLowerCase().includes(search)
    );

    const shown = matched.slice(0, MAX_BOOKS_SHOWN);
    const notShown = matched.length - shown.length;

    const myLoans = borrower
        ? loans.filter(
              (loan) => loan.userName.toLowerCase() === borrower.toLowerCase()
          )
        : [];

    const current = myLoans.filter((loan) => loan.returnedAt === null);
    const past = myLoans.filter((loan) => loan.returnedAt !== null);

    return (
        <main className={borrower ? "page page--wide" : "page"}>
            <div className={borrower ? "split" : undefined}>
                <div className={borrower ? "split__aside" : undefined}>
                    {!borrower && (
                        <h1 className="hero-title">Welcome to Elins library!</h1>
                    )}

                    <h2>Customer data</h2>
                    <div className="panel">
                        <form method="get" className="form-row">
                            <div className="field">
                                <label htmlFor="name">Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    defaultValue={borrower}
                                    placeholder="Type your name and login to borrow books"
                                    required
                                />
                            </div>
                            <button type="submit">Log in</button>
                        </form>

                        <p className="note note--spaced">
                            {borrower && (
                                <>
                                    Logged in as <strong>{borrower}</strong>
                                </>
                            )}
                        </p>
                    </div>

                    {borrower && (
                        <>
                            <h2>Your current loans ({current.length})</h2>

                            {current.length === 0 ? (
                                <p className="empty">
                                    {borrower} has no books on loan.
                                </p>
                            ) : (
                                <div className="grid">
                                    {current.map((loan) => (
                                        <LoanCard
                                            key={loan.id}
                                            loan={loan}
                                            borrower={borrower}
                                        />
                                    ))}
                                </div>
                            )}

                            <h2>Your returned loans ({past.length})</h2>

                            {past.length === 0 ? (
                                <p className="empty">Nothing returned yet.</p>
                            ) : (
                                <div className="grid">
                                    {past.map((loan) => (
                                        <LoanCard
                                            key={loan.id}
                                            loan={loan}
                                            borrower={borrower}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {borrower && (
                    <div>
                        <h2>Books</h2>

                        <div className="panel">
                            <form method="get" className="form-row">
                                <input type="hidden" name="name" value={borrower} />

                                <div className="field">
                                    <label htmlFor="q">Search book</label>
                                    <input
                                        id="q"
                                        name="q"
                                        type="text"
                                        defaultValue={query}
                                        placeholder="Type in part of a title or author"
                                    />
                                </div>

                                <button type="submit">Search</button>
                            </form>

                            {search !== "" && (
                                <p className="note note--spaced">
                                    {matched.length} of {books.length} match —{" "}
                                    <Link
                                        href={`/customer?name=${encodeURIComponent(borrower)}`}
                                        className="link"
                                    >
                                        clear filter
                                    </Link>
                                </p>
                            )}
                        </div>

                        {books.length === 0 ? (
                            <p className="empty">The library has no books.</p>
                        ) : matched.length === 0 ? (
                            <p className="empty">No books match that filter.</p>
                        ) : (
                            <div className="grid">
                                {shown.map((book) => (
                                    <BookCard
                                        key={book.id}
                                        book={book}
                                        borrower={borrower}
                                    />
                                ))}
                            </div>
                        )}

                        {notShown > 0 && (
                            <p className="note note--spaced">
                                Showing the first {shown.length} of{" "}
                                {matched.length} books — search by title or author
                                to narrow the list.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
