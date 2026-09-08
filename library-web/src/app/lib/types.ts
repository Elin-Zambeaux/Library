export type Book = {
    id: number;
    title: string;
    author: string;
    isAvailable: boolean;
    borrowedBy: string | null;
};

export type RelatedBook = {
    id: number;
    title: string;
    author: string;
    sharedBorrowers: number;
};

export type BookDetails = Book & {
    numberOfTimesLoaned: number;
    averageDaysOnLoan: number | null;
    alsoBorrowed: RelatedBook[];
};

export type User = {
    id: number;
    name: string;
};

export type Loan = {
    id: number;
    bookId: number;
    bookTitle: string;
    bookAuthor: string;
    userId: number;
    userName: string;
    loanedAt: string;
    returnedAt: string | null;
};
