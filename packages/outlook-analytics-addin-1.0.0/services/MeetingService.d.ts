import { Meeting } from '../models/Meeting';
/**
 * Service pour récupérer et gérer les réunions depuis Outlook
 *
 * Gère automatiquement :
 * - La détection de l'environnement (Desktop/Web)
 * - Le choix de l'API appropriée (REST/Office.js)
 * - La mise en cache des données
 * - Le fallback vers le mode mock si nécessaire
 *
 * @example
 * ```typescript
 * const service = new MeetingService();
 * const meetings = await service.getMeetings(startDate, endDate);
 * ```
 */
export declare class MeetingService {
    /**
     * Récupère les réunions pour une période donnée
     *
     * @param startDate - Date de début de la période
     * @param endDate - Date de fin de la période
     * @param useMock - Utiliser le mode mock (pour tests/développement)
     * @param useCache - Utiliser le cache (par défaut: true)
     * @returns Promise résolue avec la liste des réunions
     *
     * @example
     * ```typescript
     * const start = new Date('2024-01-01');
     * const end = new Date('2024-01-31');
     * const meetings = await service.getMeetings(start, end);
     * ```
     */
    getMeetings(startDate: Date, endDate: Date, useMock?: boolean, useCache?: boolean): Promise<Meeting[]>;
    /**
     * Parse les rendez-vous Office.js en objets Meeting
     */
    private parseAppointments;
    /**
     * Parse un rendez-vous individuel
     */
    private parseAppointment;
    /**
     * Extrait la liste des participants
     */
    private extractAttendees;
    /**
     * Génère un ID unique pour une réunion
     */
    private generateId;
    /**
     * Filtre les réunions par date
     */
    filterByDateRange(meetings: Meeting[], startDate: Date, endDate: Date): Meeting[];
}
//# sourceMappingURL=MeetingService.d.ts.map