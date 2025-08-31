import { AvailableSlotsDto, Consultation, ConsultationCreateDto } from "@/app/dto/consultation";
import { apiFetch } from "../api";
export async function createConsultation(body: ConsultationCreateDto) {
    return await apiFetch('/consultations', {
        method: 'POST',
        body: JSON.stringify({type: body.type, scheduledAt: body.scheduledAt, notes: body.notes, location: body.location}),
    })
}
export async function getMyConsultation(): Promise<Consultation[]> {
    const response = await apiFetch('/consultations/my', {
        method: 'GET',
    });
    return response as Consultation[];
}
export async function getAvailableSlots() : Promise<AvailableSlotsDto> {
    return await apiFetch<AvailableSlotsDto>('/consultations/slots/available', {
        method: 'GET'
    })
}