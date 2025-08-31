import { API_URL } from "@/settings";
export async function apiFetch<T>(
    endpoint: string,
    options?: RequestInit
) {
    const access_token = localStorage.getItem('access_token');
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Authorization": `Bearer ${access_token}`,
            "Content-Type": "application/json",
            ...(options?.headers || {})
        },
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API ERROR: ${res.status}: ${errorText}`)
    }
    return res.json() as Promise<T>;
}