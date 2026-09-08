"use server";

import { revalidatePath } from "next/cache";
import { API_BASE } from "./api";
import type { User } from "./types";

function refreshAll() {
    revalidatePath("/librarian");
    revalidatePath("/customer");
}

async function send(url: string, method: string, body?: unknown) {
    const response = await fetch(url, {
        method,
        headers: body === undefined ? undefined : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
    });

    if (!response.ok) {
        const detail = (await response.text()).replace(/^"|"$/g, "");
        throw new Error(detail || `Request failed: ${response.status}`);
    }

    return response;
}

export async function addBook(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();

    if (!title || !author) {
        throw new Error("Title and author are required.");
    }

    await send(`${API_BASE}/Books`, "POST", { title, author });
    refreshAll();
}

export async function deleteBook(formData: FormData) {
    const id = formData.get("id");

    await send(`${API_BASE}/Books/${id}`, "DELETE");
    refreshAll();
}

export async function borrowBook(formData: FormData) {
    const bookId = Number(formData.get("id"));
    const borrower = String(formData.get("borrower") ?? "").trim();

    if (!borrower) {
        throw new Error("Enter your name before borrowing a book.");
    }

    const response = await send(`${API_BASE}/Users`, "POST", { name: borrower });
    const user: User = await response.json();

    await send(`${API_BASE}/Loans`, "POST", { bookId, userId: user.id });
    refreshAll();
}

export async function returnBook(formData: FormData) {
    const loanId = formData.get("loanId");

    await send(`${API_BASE}/Loans/${loanId}/return`, "POST");
    refreshAll();
}
