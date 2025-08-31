export const API_URL = typeof window === "undefined"
    ? "http://backend:3000/api" // сервер (Docker)
    : "http://localhost:3000/api"; // клиент