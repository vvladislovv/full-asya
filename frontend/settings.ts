export const API_URL = typeof window === "undefined"
    ? "http://backend:3000/api" // сервер (Docker)
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"; // клиент