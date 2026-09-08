import { returnBook } from "../lib/actions";
import type { Loan } from "../lib/types";
import { ShowInfoForm } from "./ShowInfoForm";

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-GB");
}

export function LoanCard({ loan, borrower }: { loan: Loan; borrower: string }) {
    const returnedAt = loan.returnedAt;

    return (
        <article className={returnedAt ? "card card--quiet" : "card"}>
            <h3 className="card__title">{loan.bookTitle}</h3>
            <p className="card__author">{loan.bookAuthor}</p>
            <p className="card__meta">
                {returnedAt
                    ? `${formatDate(loan.loanedAt)} → ${formatDate(returnedAt)}`
                    : `Borrowed ${formatDate(loan.loanedAt)}`}
            </p>

            {!returnedAt && (
                <div className="card__actions card__actions--inline">
                    <form action={returnBook}>
                        <input type="hidden" name="loanId" value={loan.id} />
                        <button type="submit">Return</button>
                    </form>

                    <ShowInfoForm bookId={loan.bookId} borrower={borrower} />
                </div>
            )}
        </article>
    );
}
