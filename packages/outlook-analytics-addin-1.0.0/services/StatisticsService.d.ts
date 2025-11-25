import { ClassifiedMeeting } from '../models/Meeting';
/**
 * Statistiques de réunions
 */
export interface MeetingStatistics {
    total: number;
    totalDuration: number;
    averageDuration: number;
    byColor: {
        red: number;
        green: number;
        blue: number;
        default: number;
    };
    byColorDuration: {
        red: number;
        green: number;
        blue: number;
        default: number;
    };
    weeklyFrequency: number;
    monthlyFrequency: number;
    averagePerDay: number;
    busiestDays: {
        date: string;
        count: number;
    }[];
    busiestHours: {
        hour: number;
        count: number;
    }[];
}
/**
 * Service pour calculer les statistiques sur les réunions
 *
 * @example
 * ```typescript
 * const service = new StatisticsService();
 * const stats = service.calculateStatistics(meetings);
 * console.log(`Total: ${stats.total}, Moyenne: ${stats.averageDuration} min`);
 * ```
 */
export declare class StatisticsService {
    /**
     * Calcule les statistiques complètes pour une liste de réunions
     *
     * @param meetings - Liste des réunions classifiées
     * @returns Statistiques complètes (total, durée, fréquence, etc.)
     *
     * @example
     * ```typescript
     * const stats = service.calculateStatistics(classifiedMeetings);
     * // stats.total = nombre total de réunions
     * // stats.byColor.red = nombre de réunions rouges
     * // stats.weeklyFrequency = fréquence hebdomadaire
     * ```
     */
    calculateStatistics(meetings: ClassifiedMeeting[]): MeetingStatistics;
    /**
     * Calcule le nombre total de minutes passées en réunions
     *
     * @param meetings - Liste des réunions
     * @returns Durée totale en minutes
     */
    private calculateTotalDuration;
    /**
     * Calcule le nombre de réunions par couleur
     *
     * @param meetings - Liste des réunions classifiées
     * @returns Nombre de réunions par couleur (rouge, vert, bleu, défaut)
     *
     * @example
     * ```typescript
     * const counts = service.calculateCountByColor(meetings);
     * // counts.red = 10, counts.green = 5, counts.blue = 3
     * ```
     */
    calculateCountByColor(meetings: ClassifiedMeeting[]): {
        red: number;
        green: number;
        blue: number;
        default: number;
    };
    /**
     * Calcule la durée totale par couleur (optimisé)
     *
     * @param meetings - Liste des réunions classifiées
     * @returns Durée totale en minutes par couleur
     */
    private calculateDurationByColor;
    /**
     * Trouve la plage de dates des réunions
     */
    private getDateRange;
    /**
     * Trouve les jours avec le plus de réunions
     */
    private findBusiestDays;
    /**
     * Trouve les créneaux horaires les plus chargés
     */
    private findBusiestHours;
    /**
     * Retourne des statistiques vides
     */
    private getEmptyStatistics;
}
//# sourceMappingURL=StatisticsService.d.ts.map