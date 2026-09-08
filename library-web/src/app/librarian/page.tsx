import { getBooks } from "../lib/api";
import { addBook, deleteBook } from "../lib/actions";

export default async function LibrarianPage() {
    const books = await getBooks();

    return (
        <main className="page">
            <h2>Add a book</h2>
            <div className="panel">
                <form action={addBook} className="form-row">
                    <div className="field">
                        <label htmlFor="title">Title</label>
                        <input id="title" name="title" type="text" required />
                    </div>
                    <div className="field">
                        <label htmlFor="author">Author</label>
                        <input id="author" name="author" type="text" required />
                    </div>
                    <button type="submit">Add book</button>
                </form>
            </div>

            <h2>Books ({books.length})</h2>

            {books.length === 0 ? (
                <p className="empty">The collection is empty. Add the first book above.</p>
            ) : (
                <div className="grid">
                    {books.map((book) => (
                        <article key={book.id} className="card">
                            <h3 className="card__title">{book.title}</h3>
                            <p className="card__author">{book.author}</p>

                            {book.isAvailable ? (
                                <span className="badge">On the shelf</span>
                            ) : (
                                <span className="badge badge--out">
                                    With {book.borrowedBy}
                                </span>
                            )}

                            <div className="card__actions">
                                <form action={deleteBook}>
                                    <input type="hidden" name="id" value={book.id} />
                                    <button
                                        type="submit"
                                        className="button--ghost button--danger"
                                        disabled={!book.isAvailable}
                                        title={
                                            book.isAvailable
                                                ? undefined
                                                : "On loan - cannot be removed"
                                        }
                                    >
                                        Remove
                                    </button>
                                </form>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
