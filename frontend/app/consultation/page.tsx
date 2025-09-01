"use client";
import { useLanguage } from "@/app/hooks/useLanguage";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createConsultation, getAvailableSlots, getMyConsultation } from "../api/services/consultationService";
import ExtensionCleanup from "../components/ExtensionCleanup";

import { Consultation, ConsultationCreateDto } from "../dto/consultation";
import { formatDateTimeSafe } from "../utils/dateUtils";

const ConsultationPage: React.FC = () => {
	const { t } = useLanguage();
	const [consultations, setConsultations] = useState<Consultation[]>([]);
	const [form, setForm] = useState<ConsultationCreateDto>({
		type: "offline",
		scheduledAt: "",
		notes: "",
		location: ""
	});
	const [slots, setSlots] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	// Мемоизируем функции для оптимизации производительности
	const loadConsultations = useCallback(async () => {
		try {
			const res = await getMyConsultation();
			setConsultations(Array.isArray(res) ? res : Object.values(res));
		} catch (err) {
			setError(t('errors.consultation_load_error'));
			console.error("Ошибка загрузки консультаций:", err);
		}
	}, []);

	const loadSlots = useCallback(async () => {
		try {
			const res = await getAvailableSlots();
			setSlots(Array.isArray(res.availableSlots) ? res.availableSlots : Object.values(res.availableSlots));
		} catch (err) {
			console.error("Ошибка загрузки слотов:", err);
		}
	}, []);

	// Загружаем данные только один раз при монтировании
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await Promise.all([loadConsultations(), loadSlots()]);
			setLoading(false);
		};
		loadData();
	}, [loadConsultations, loadSlots]);

	// Мемоизируем обработчик изменений формы
	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
		// Очищаем ошибку при изменении формы
		if (error) setError("");
	}, [error]);

	// Мемоизируем обработчик отправки формы
	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Валидация формы
		if (!form.type || (form.type !== "online" && form.type !== "offline")) {
			setError(t('errors.select_consultation_type'));
			return;
		}
		if (!form.scheduledAt) {
			setError(t('errors.select_date_time'));
			return;
		}

		setSubmitting(true);
		setError("");

		try {
			await createConsultation(form);
			await loadConsultations();
			setForm({ type: "offline", scheduledAt: "", notes: "", location: "" });
		} catch (err: unknown) {
			// Безопасная обработка ошибок
			let errorMessage = t('errors.consultation_create_error');
			
			if (err && typeof err === "object") {
				if (err instanceof Error && err.message) {
					errorMessage = `Ошибка: ${err.message}`;
				} else {
					const maybeResponse = err as { response?: { data?: { message?: string } } };
					if (maybeResponse.response?.data?.message) {
						errorMessage = `Ошибка: ${maybeResponse.response.data.message}`;
					}
				}
			}
			
			setError(errorMessage);
			console.error("Ошибка создания консультации:", err);
		} finally {
			setSubmitting(false);
		}
	}, [form, loadConsultations]);

	// Мемоизируем отформатированные слоты
	const formattedSlots = useMemo(() => {
		return slots.map(slot => ({
			value: slot,
			label: formatDateTimeSafe(slot, 'ru-RU', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}, 'Недоступно')
		}));
	}, [slots]);

	// Мемоизируем статус консультаций
	const getStatusInfo = useCallback((status: string) => {
		switch (status) {
			case 'confirmed':
				return { label: 'Подтверждена', className: 'bg-[#8DC63F] text-white' };
			case 'pending':
				return { label: 'Ожидает', className: 'bg-[#FDB933] text-white' };
			case 'cancelled':
				return { label: 'Отменена', className: 'bg-[#D9452B] text-white' };
			default:
				return { label: status, className: 'bg-gray-500 text-white' };
		}
	}, []);

	return (
		<ExtensionCleanup>
			<div className="bg-[#F2F5F9] w-screen min-h-screen px-4 py-6 flex flex-col gap-3">
				{/* Заголовок */}
				<div className="relative flex items-center">
					<Link 
						href="/"
						className="hover:cursor-pointer active:scale-[0.95] transition-all duration-300 w-[48px] h-[48px] rounded-full bg-[white] flex justify-center items-center"
						style={{zIndex: 1}}
					>
						<Image src="/icons/back.svg" alt={t('common.back')} width={10} height={14} style={{ width: 'auto', height: 'auto' }} />
					</Link>
					<div
						className="pointer-events-none absolute left-0 right-0 text-[20px] text-center font-[600]"
						style={{zIndex: 0}}
					>
						Мои консультации
					</div>

				</div>

				{/* Загрузка */}
				{loading && (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DC63F]"></div>
					</div>
				)}

				{/* Ошибка */}
				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
						<span>⚠️</span>
						<p className="text-[14px]">{error}</p>
					</div>
				)}

				{/* Список консультаций */}
				<div className="flex flex-col gap-3">
					<h2 className="font-[600] text-[16px] text-[#1E1E1E]">Текущие консультации</h2>
					{consultations.length === 0 && !loading ? (
						<div className="bg-white rounded-[12px] p-6 text-center">
							<div className="text-4xl mb-2">📭</div>
							<p className="font-[600] text-[16px] text-[#1E1E1E] mb-1">У вас пока нет консультаций</p>
							<p className="text-[14px] text-gray-700">Создайте первую консультацию ниже</p>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							{consultations.map((consultation) => {
								const statusInfo = getStatusInfo(consultation.status);
								return (
									<div key={consultation.id} className="bg-white rounded-[12px] p-4">
										<div className="flex justify-between items-start mb-3">
											<div className="flex items-center gap-3">
												<div className={`rounded-full w-[38px] h-[38px] flex justify-center items-center ${
													consultation.type === 'online' ? 'bg-[#8DC63F]' : 'bg-[#1C2D56]'
												}`}>
													<span className="text-white text-lg">
														{consultation.type === 'online' ? '💻' : '🏥'}
													</span>
												</div>
												<div>
													<h3 className="font-[600] text-[14px] text-[#1E1E1E]">
														{consultation.type === 'online' ? 'Онлайн консультация' : 'Оффлайн консультация'}
													</h3>
													<p className="text-[12px] text-gray-700">
														{consultation.type === 'online' ? 'Видеозвонок' : 'В клинике'}
													</p>
												</div>
											</div>
											<span className={`px-3 py-1 rounded-full text-[12px] font-[500] ${statusInfo.className}`}>
												{statusInfo.label}
											</span>
										</div>
										
										<div className="flex flex-col gap-2 mb-3">
											<div className="flex items-center gap-2">
												<span className="text-gray-700">📅</span>
												<span className="text-[13px] text-[#1E1E1E]">
													{formatDateTimeSafe(consultation.scheduledAt, 'ru-RU', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit'
													}, 'Дата не указана')}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-gray-700">📍</span>
												<span className="text-[13px] text-[#1E1E1E]">
													{consultation.location || 'Место не указано'}
												</span>
											</div>
										</div>
										
										{consultation.notes && (
											<div className="bg-gray-50 rounded-lg p-3">
												<div className="flex items-start gap-2">
													<span className="text-gray-700 mt-0.5">📝</span>
													<p className="text-[13px] text-[#1E1E1E]">{consultation.notes}</p>
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Форма создания */}
				<div className="bg-white rounded-[12px] p-4">
					<h2 className="font-[600] text-[16px] text-[#1E1E1E] mb-4 flex items-center gap-2">
						<div className="rounded-full w-[32px] h-[32px] bg-[#8DC63F] flex justify-center items-center">
							<span className="text-white text-sm">➕</span>
						</div>
						<span>Создать новую консультацию</span>
					</h2>
					
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div className="grid grid-cols-1 gap-4">
							<div className="flex flex-col gap-2">
								<label htmlFor="type" className="font-[500] text-[14px] text-[#1E1E1E]">
									Тип консультации
								</label>
								<select 
									name="type" 
									id="type" 
									value={form.type} 
									onChange={handleChange}
									className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
								>
									<option value="offline">🏥 Оффлайн</option>
									<option value="online">💻 Онлайн</option>
								</select>
							</div>
							
							<div className="flex flex-col gap-2">
								<label htmlFor="scheduledAt" className="font-[500] text-[14px] text-[#1E1E1E]">
									Дата и время
								</label>
								<select 
									name="scheduledAt" 
									id="scheduledAt" 
									value={form.scheduledAt} 
									onChange={handleChange}
									className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
								>
									<option value="">Выберите слот</option>
									{formattedSlots.map((slot, idx) => (
										<option key={idx} value={slot.value}>{slot.label}</option>
									))}
								</select>
							</div>
						</div>
						
						<div className="flex flex-col gap-2">
							<label htmlFor="location" className="font-[500] text-[14px] text-[#1E1E1E]">
								Место проведения
							</label>
							<input 
								name="location" 
								id="location" 
								value={form.location} 
								onChange={handleChange} 
								placeholder={t('consultations.location_placeholder')} 
								className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent"
							/>
						</div>
						
						<div className="flex flex-col gap-2">
							<label htmlFor="notes" className="font-[500] text-[14px] text-[#1E1E1E]">
								Заметки
							</label>
							<textarea 
								name="notes" 
								id="notes" 
								value={form.notes} 
								onChange={handleChange} 
								placeholder={t('consultations.notes_placeholder')} 
								rows={3}
								className="border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#8DC63F] focus:border-transparent resize-none"
							/>
						</div>
						
						<button 
							type="submit" 
							disabled={submitting}
							className="bg-[#8DC63F] text-white font-[600] text-[14px] py-3 px-6 rounded-lg hover:bg-[#7AB32F] active:scale-[0.97] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{submitting ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									Создание...
								</>
							) : (
								'Создать консультацию'
							)}
						</button>
					</form>
				</div>
			</div>
		</ExtensionCleanup>
	);
};

export default ConsultationPage;