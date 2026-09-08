export function ShowInfoForm({
    bookId,
    borrower,
}: {
    bookId: number;
    borrower: string;
}) {
    return (
        <form method="get" action={`/customer/books/${bookId}`}>
            <input type="hidden" name="name" value={borrower} />
            <button type="submit" className="button--ghost">
                Show info
            </button>
        </form>
    );
}
