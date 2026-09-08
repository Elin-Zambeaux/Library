import type { Book, BookDetails, Loan } from "./types";

export const API_BASE = "https://localhost:7225";

async function getJson<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });

    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }

    return response.json();
}

export function getBooks(): Promise<Book[]> {
    return getJson<Book[]>("/Books");
}

export function getLoans(): Promise<Loan[]> {
    return getJson<Loan[]>("/Loans");
}

export async function getBook(id: number): Promise<BookDetails | undefined> {
    const response = await fetch(`${API_BASE}/Books/${id}`, { cache: "no-store" });

    if (response.status === 404) {
        return undefined;
    }

    if (!response.ok) {
        throw new Error(`Failed to load book ${id}: ${response.status}`);
    }

    return response.json();
}
