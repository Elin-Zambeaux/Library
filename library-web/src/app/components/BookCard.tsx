import { borrowBook } from "../lib/actions";
import type { Book } from "../lib/types";
import { ShowInfoForm } from "./ShowInfoForm";

export function BookCard({ book, borrower }: { book: Book; borrower: string }) {
    return (
        <article className="card">
            <h3 className="card__title">{book.title}</h3>
            <p className="card__author">{book.author}</p>
            <div className="card__actions card__actions--inline">
                <form action={borrowBook}>
                    <input type="hidden" name="id" value={book.id} />
                    <input type="hidden" name="borrower" value={borrower} />
                    <button
                        type="submit"
                        disabled={!book.isAvailable}
                        title={
                            book.isAvailable
                                ? undefined
                                : `On loan to ${book.borrowedBy}`
                        }
                    >
                        Borrow
                    </button>
                </form>

                <ShowInfoForm bookId={book.id} borrower={borrower} />
            </div>
        </article>
    );
}
