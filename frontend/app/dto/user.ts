import type { DementiaRiskLevels } from "./health"
export type User = {
    id: string,
    telegramId: string,
    username?: string,
    firstName?: string,
    lastName?: string,
    telegramPhotoUrl?: string,
    photoUrl?: string,

    language: string,

    dementiaRiskLevel?: DementiaRiskLevels
    dementiaQuestionnaire?: JSON
    hasCompletedDiagnostic: boolean,

    isActive: boolean,
    isAdmin: boolean,

    createdAt: Date,
    updatedAt: Date,
}
export type LoginDto = {
    access_token: string,
    user: User | null,
}