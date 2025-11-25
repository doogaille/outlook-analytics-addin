import { ClassifiedMeeting, MeetingColor } from '../models/Meeting';

/**
 * Statistiques de réunions
 */
export interface MeetingStatistics {
  total: number;
  totalDuration: number; // en minutes
  averageDuration: number; // en minutes
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
  busiestDays: { date: string; count: number }[];
  busiestHours: { hour: number; count: number }[];
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
export class StatisticsService {
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
  calculateStatistics(meetings: ClassifiedMeeting[]): MeetingStatistics {
    if (meetings.length === 0) {
      return this.getEmptyStatistics();
    }

    const total = meetings.length;
    const totalDuration = this.calculateTotalDuration(meetings);
    const averageDuration = totalDuration / total;

    const byColor = this.calculateCountByColor(meetings);
    const byColorDuration = this.calculateDurationByColor(meetings);

    const dateRange = this.getDateRange(meetings);
    const daysDiff = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weeksDiff = daysDiff / 7;
    const monthsDiff = daysDiff / 30;

    const weeklyFrequency = weeksDiff > 0 ? total / weeksDiff : 0;
    const monthlyFrequency = monthsDiff > 0 ? total / monthsDiff : 0;
    const averagePerDay = daysDiff > 0 ? total / daysDiff : 0;

    const busiestDays = this.findBusiestDays(meetings);
    const busiestHours = this.findBusiestHours(meetings);

    return {
      total,
      totalDuration,
      averageDuration,
      byColor,
      byColorDuration,
      weeklyFrequency,
      monthlyFrequency,
      averagePerDay,
      busiestDays,
      busiestHours,
    };
  }

  /**
   * Calcule le nombre total de minutes passées en réunions
   * 
   * @param meetings - Liste des réunions
   * @returns Durée totale en minutes
   */
  private calculateTotalDuration(meetings: ClassifiedMeeting[]): number {
    return meetings.reduce((sum, meeting) => sum + meeting.duration, 0);
  }

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
  } {
    // Optimisation : un seul passage au lieu de 4 filtres
    const counts = { red: 0, green: 0, blue: 0, default: 0 };
    meetings.forEach((meeting) => {
      switch (meeting.color) {
        case MeetingColor.RED:
          counts.red++;
          break;
        case MeetingColor.GREEN:
          counts.green++;
          break;
        case MeetingColor.BLUE:
          counts.blue++;
          break;
        default:
          counts.default++;
      }
    });
    return counts;
  }

  /**
   * Calcule la durée totale par couleur (optimisé)
   * 
   * @param meetings - Liste des réunions classifiées
   * @returns Durée totale en minutes par couleur
   */
  private calculateDurationByColor(meetings: ClassifiedMeeting[]): {
    red: number;
    green: number;
    blue: number;
    default: number;
  } {
    // Optimisation : un seul passage au lieu de 4 filtres + réductions
    const durations = { red: 0, green: 0, blue: 0, default: 0 };
    meetings.forEach((meeting) => {
      switch (meeting.color) {
        case MeetingColor.RED:
          durations.red += meeting.duration;
          break;
        case MeetingColor.GREEN:
          durations.green += meeting.duration;
          break;
        case MeetingColor.BLUE:
          durations.blue += meeting.duration;
          break;
        default:
          durations.default += meeting.duration;
      }
    });
    return durations;
  }

  /**
   * Trouve la plage de dates des réunions
   */
  private getDateRange(meetings: ClassifiedMeeting[]): { start: Date; end: Date } {
    if (meetings.length === 0) {
      const now = new Date();
      return { start: now, end: now };
    }

    const dates = meetings.map((m) => m.start);
    return {
      start: new Date(Math.min(...dates.map((d) => d.getTime()))),
      end: new Date(Math.max(...dates.map((d) => d.getTime()))),
    };
  }

  /**
   * Trouve les jours avec le plus de réunions
   */
  private findBusiestDays(meetings: ClassifiedMeeting[]): { date: string; count: number }[] {
    const dayCounts = new Map<string, number>();

    meetings.forEach((meeting) => {
      const dateKey = meeting.start.toISOString().split('T')[0];
      dayCounts.set(dateKey, (dayCounts.get(dateKey) || 0) + 1);
    });

    return Array.from(dayCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Trouve les créneaux horaires les plus chargés
   */
  private findBusiestHours(meetings: ClassifiedMeeting[]): { hour: number; count: number }[] {
    const hourCounts = new Map<number, number>();

    meetings.forEach((meeting) => {
      const hour = meeting.start.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    return Array.from(hourCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Retourne des statistiques vides
   */
  private getEmptyStatistics(): MeetingStatistics {
    return {
      total: 0,
      totalDuration: 0,
      averageDuration: 0,
      byColor: { red: 0, green: 0, blue: 0, default: 0 },
      byColorDuration: { red: 0, green: 0, blue: 0, default: 0 },
      weeklyFrequency: 0,
      monthlyFrequency: 0,
      averagePerDay: 0,
      busiestDays: [],
      busiestHours: [],
    };
  }
}

