export type ConsultationCreateDto = {
    type: string,
    scheduledAt: string,
    notes: string,
    location: string,
}
export type Consultation = {
    id: string,
    userId: string,
    type: "online" | "offline",
    status: string,
    scheduledAt?: string,
    notes?: string,
    doctorNotes?: string | null,
    meetingLink?: string | null,
    location?: string,
    createdAt?: string,
    updatedAt?: string,
}
export type AvailableSlotsDto = {
    availableSlots: string[];
}