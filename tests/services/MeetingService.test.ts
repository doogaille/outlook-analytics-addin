import { MeetingService } from '../../src/services/MeetingService';
import { Meeting } from '../../src/models/Meeting';

describe('MeetingService', () => {
  let service: MeetingService;

  beforeEach(() => {
    service = new MeetingService();
  });

  describe('getMeetings', () => {
    it('devrait utiliser le mock en fallback si Office.js n\'est pas disponible', async () => {
      // Mock Office.js comme non disponible
      const originalOffice = (global as any).Office;
      (global as any).Office = undefined;

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Le service devrait utiliser le mock en fallback au lieu de lancer une erreur
      const meetings = await service.getMeetings(startDate, endDate, false);
      expect(meetings.length).toBeGreaterThan(0);

      // Restaurer
      (global as any).Office = originalOffice;
    });

    it('devrait récupérer les réunions d\'une période donnée', async () => {
      // Ce test nécessitera un mock plus complet de l'API Outlook
      // Pour l'instant, on teste la structure
      expect(service).toBeDefined();
    });
  });

  describe('filterByDateRange', () => {
    it('devrait filtrer les réunions par plage de dates', () => {
      const meetings: Meeting[] = [
        {
          id: '1',
          subject: 'Réunion 1',
          start: new Date('2024-01-15'),
          end: new Date('2024-01-15T10:00:00'),
          duration: 60,
        },
        {
          id: '2',
          subject: 'Réunion 2',
          start: new Date('2024-02-15'),
          end: new Date('2024-02-15T10:00:00'),
          duration: 60,
        },
        {
          id: '3',
          subject: 'Réunion 3',
          start: new Date('2024-01-20'),
          end: new Date('2024-01-20T10:00:00'),
          duration: 60,
        },
      ];

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const filtered = service.filterByDateRange(meetings, startDate, endDate);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((m) => m.id)).toEqual(['1', '3']);
    });

    it('devrait retourner un tableau vide si aucune réunion ne correspond', () => {
      const meetings: Meeting[] = [
        {
          id: '1',
          subject: 'Réunion 1',
          start: new Date('2024-02-15'),
          end: new Date('2024-02-15T10:00:00'),
          duration: 60,
        },
      ];

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const filtered = service.filterByDateRange(meetings, startDate, endDate);

      expect(filtered).toHaveLength(0);
    });
  });
});

