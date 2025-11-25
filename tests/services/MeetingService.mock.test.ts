import { MeetingService } from '../../src/services/MeetingService';
import { ClassificationService } from '../../src/services/ClassificationService';
import { MeetingColor } from '../../src/models/Meeting';

describe('MeetingService avec Mock', () => {
  let service: MeetingService;
  let classificationService: ClassificationService;

  beforeEach(() => {
    service = new MeetingService();
    classificationService = new ClassificationService();
  });

  describe('getMeetings avec mock', () => {
    it('devrait récupérer des réunions mockées', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07'); // Une semaine

      const meetings = await service.getMeetings(startDate, endDate, true); // useMock = true

      expect(meetings.length).toBeGreaterThan(0);
      expect(meetings[0]).toHaveProperty('id');
      expect(meetings[0]).toHaveProperty('subject');
      expect(meetings[0]).toHaveProperty('start');
      expect(meetings[0]).toHaveProperty('end');
      expect(meetings[0]).toHaveProperty('duration');
    });

    it('devrait générer des réunions variées (stand-up, direction, formation)', async () => {
      // Utiliser une période qui inclut le premier jeudi du mois (formation)
      const startDate = new Date('2024-01-01'); // 1er janvier = lundi
      const endDate = new Date('2024-01-31'); // Un mois complet

      const meetings = await service.getMeetings(startDate, endDate, true);
      const classified = classificationService.classifyMeetings(meetings);

      // Vérifier qu'on a différents types de réunions
      const subjects = meetings.map((m) => m.subject);
      expect(subjects.some((s) => s.includes('Stand-up'))).toBe(true);
      expect(subjects.some((s) => s.includes('direction'))).toBe(true);
      
      // Vérifier la classification - au moins 2 couleurs différentes
      const colors = classified.map((m) => m.color);
      const uniqueColors = [...new Set(colors)];
      expect(uniqueColors.length).toBeGreaterThanOrEqual(2);
      expect(colors).toContain(MeetingColor.GREEN); // Stand-up = flex
      expect(colors).toContain(MeetingColor.RED); // Direction = no flex
    });

    it('devrait parser correctement les dates', async () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');

      const meetings = await service.getMeetings(startDate, endDate, true);

      if (meetings.length > 0) {
        expect(meetings[0].start).toBeInstanceOf(Date);
        expect(meetings[0].end).toBeInstanceOf(Date);
        expect(meetings[0].duration).toBeGreaterThan(0);
      }
    });

    it('devrait calculer correctement la durée', async () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');

      const meetings = await service.getMeetings(startDate, endDate, true);

      meetings.forEach((meeting) => {
        const expectedDuration = Math.round(
          (meeting.end.getTime() - meeting.start.getTime()) / (1000 * 60)
        );
        expect(meeting.duration).toBe(expectedDuration);
      });
    });
  });

  describe('fallback vers mock', () => {
    it('devrait utiliser le mock si Office.js n\'est pas disponible', async () => {
      // Simuler l'absence d'Office.js
      const originalOffice = (global as any).Office;
      (global as any).Office = undefined;

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');

      const meetings = await service.getMeetings(startDate, endDate, false);

      expect(meetings.length).toBeGreaterThan(0);

      // Restaurer
      (global as any).Office = originalOffice;
    });
  });
});

