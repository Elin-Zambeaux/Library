import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook } from "../../../lib/api";
import { borrowBook } from "../../../lib/actions";

export default async function BookPage(props: PageProps<"/customer/books/[id]">) {
    const [{ id }, { name }] = await Promise.all([props.params, props.searchParams]);
    const bookId = Number(id);
    const borrower = typeof name === "string" ? name.trim() : "";

    if (!Number.isInteger(bookId)) {
        notFound();
    }

    const book = await getBook(bookId);

    if (!book) {
        notFound();
    }

    const withName = (path: string) =>
        borrower ? `${path}?name=${encodeURIComponent(borrower)}` : path;

    let borrowHint: string | undefined;
    if (!book.isAvailable) {
        borrowHint = "Book is currently not available";
    } else if (!borrower) {
        borrowHint = "Enter your name on the books page first";
    }

    return (
        <main className="page">
            <p className="note">
                <Link href={withName("/customer")} className="link">
                    ← Back to books
                </Link>
            </p>

            <h2>Book</h2>
            <div className="panel">
                <h3 className="card__title">{book.title}</h3>
                <p className="card__author">{book.author}</p>

                {book.isAvailable ? (
                    <span className="badge">Available</span>
                ) : (
                    <span className="badge badge--out">Not available</span>
                )}

                <div className="stat">
                    <div>
                        <div className="stat__value">{book.numberOfTimesLoaned}</div>
                        <div className="stat__label">
                            {book.numberOfTimesLoaned === 1 ? "previous reader" : "previous readers"}
                        </div>
                    </div>
                    <div>
                        <div className="stat__value">
                            {book.averageDaysOnLoan === null
                                ? "—"
                                : Math.round(book.averageDaysOnLoan)}
                        </div>
                        <div className="stat__label">average days on loan</div>
                    </div>
                </div>

                <div className="card__actions">
                    <form action={borrowBook}>
                        <input type="hidden" name="id" value={book.id} />
                        <input type="hidden" name="borrower" value={borrower} />
                        <button
                            type="submit"
                            disabled={!borrower || !book.isAvailable}
                            title={borrowHint}
                        >
                            Borrow
                        </button>
                    </form>
                </div>
            </div>

            <h2>Readers of this book also borrowed</h2>

            {book.alsoBorrowed.length === 0 ? (
                <p className="empty">
                    Nobody who borrowed this book has borrowed anything else.
                </p>
            ) : (
                <div className="grid">
                    {book.alsoBorrowed.map((related) => (
                        <article key={related.id} className="card">
                            <h3 className="card__title">
                                <Link href={withName(`/customer/books/${related.id}`)}>
                                    {related.title}
                                </Link>
                            </h3>
                            <p className="card__author">{related.author}</p>
                            <p className="card__meta">
                                {related.sharedBorrowers}{" "}
                                {related.sharedBorrowers === 1
                                    ? "reader"
                                    : "readers"}{" "}
                                borrowed both
                            </p>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
