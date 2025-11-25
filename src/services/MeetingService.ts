import { Meeting } from '../models/Meeting';
import { OutlookAPI } from '../utils/OutlookAPI';
import { OutlookAPIMock } from '../utils/OutlookAPIMock';
import { OutlookRESTAPI } from '../utils/OutlookRESTAPI';
import { CacheService } from '../utils/CacheService';

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
export class MeetingService {
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
  async getMeetings(
    startDate: Date,
    endDate: Date,
    useMock: boolean = false,
    useCache: boolean = true
  ): Promise<Meeting[]> {
    // Vérifier le cache
    if (useCache && !useMock) {
      const cacheKey = CacheService.generateKey('meetings', startDate, endDate);
      const cached = CacheService.get<Meeting[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    let appointments: any[] = [];

    if (useMock) {
      // Mode mock pour les tests et le développement
      appointments = OutlookAPIMock.generateMockAppointments(startDate, endDate);
    } else if (!OutlookAPI.isAvailable()) {
      // Si Office.js n'est pas disponible, utiliser le mock en fallback
      console.warn('Office.js non disponible, utilisation du mock');
      appointments = OutlookAPIMock.generateMockAppointments(startDate, endDate);
    } else {
      try {
        // Adapter la méthode selon l'environnement détecté
        const diagnostics = OutlookAPI.getDiagnostics();
        
        // Pour Outlook Desktop, certaines API peuvent être différentes
        if (diagnostics.isDesktop) {
          console.log('[MeetingService] Mode Outlook Desktop détecté');
          
          // Sur Desktop, l'API REST peut ne pas être disponible selon la version Exchange
          if (OutlookAPI.hasCapability('REST') && OutlookRESTAPI.isRESTAvailable()) {
            console.log('[MeetingService] Utilisation de l\'API REST');
            appointments = await OutlookRESTAPI.getCalendarEventsWithFallback(startDate, endDate);
          } else {
            // Fallback pour Desktop : utiliser l'API Office.js standard
            console.log('[MeetingService] Utilisation de l\'API Office.js standard (fallback Desktop)');
            appointments = await OutlookAPI.getCalendarItems(startDate, endDate);
          }
        } else {
          // Pour Outlook Web App, l'API REST est généralement disponible
          console.log('[MeetingService] Mode Outlook Web App détecté');
          
          if (OutlookRESTAPI.isRESTAvailable()) {
            appointments = await OutlookRESTAPI.getCalendarEventsWithFallback(startDate, endDate);
          } else {
            appointments = await OutlookAPI.getCalendarItems(startDate, endDate);
          }
        }
      } catch (error) {
        // En cas d'erreur, utiliser le mock en fallback
        console.warn('[MeetingService] Erreur lors de la récupération des réunions, utilisation du mock:', error);
        appointments = OutlookAPIMock.generateMockAppointments(startDate, endDate);
      }
    }

    const meetings = this.parseAppointments(appointments);

    // Mettre en cache si demandé
    if (useCache && !useMock) {
      const cacheKey = CacheService.generateKey('meetings', startDate, endDate);
      CacheService.set(cacheKey, meetings, 5 * 60 * 1000); // 5 minutes
    }

    return meetings;
  }

  /**
   * Parse les rendez-vous Office.js en objets Meeting
   */
  private parseAppointments(appointments: any[]): Meeting[] {
    return appointments.map((apt) => this.parseAppointment(apt));
  }

  /**
   * Parse un rendez-vous individuel
   */
  private parseAppointment(appointment: any): Meeting {
    const start = new Date(appointment.start);
    const end = new Date(appointment.end);
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

    return {
      id: appointment.itemId || this.generateId(),
      subject: appointment.subject || 'Sans objet',
      start,
      end,
      duration,
      location: appointment.location,
      organizer: appointment.organizer?.emailAddress?.address,
      attendees: this.extractAttendees(appointment),
      body: appointment.bodyPreview || appointment.body,
      isAllDay: appointment.isAllDayEvent || false,
    };
  }

  /**
   * Extrait la liste des participants
   */
  private extractAttendees(appointment: any): string[] {
    if (!appointment.attendees) return [];
    return appointment.attendees.map((attendee: any) => 
      attendee.emailAddress?.address || attendee.displayName || ''
    ).filter((email: string) => email !== '');
  }

  /**
   * Génère un ID unique pour une réunion
   */
  private generateId(): string {
    return `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Filtre les réunions par date
   */
  filterByDateRange(
    meetings: Meeting[],
    startDate: Date,
    endDate: Date
  ): Meeting[] {
    return meetings.filter((meeting) => {
      return meeting.start >= startDate && meeting.end <= endDate;
    });
  }
}

