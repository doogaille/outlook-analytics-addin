import { StatisticsService } from '../../src/services/StatisticsService';
import { ClassifiedMeeting, MeetingColor } from '../../src/models/Meeting';

describe('StatisticsService', () => {
  let service: StatisticsService;

  beforeEach(() => {
    service = new StatisticsService();
  });

  describe('calculateStatistics', () => {
    it('devrait calculer le nombre total de réunions', () => {
      const meetings: ClassifiedMeeting[] = [
        createMeeting('1', MeetingColor.RED, 60),
        createMeeting('2', MeetingColor.GREEN, 30),
        createMeeting('3', MeetingColor.BLUE, 120),
      ];

      const stats = service.calculateStatistics(meetings);

      expect(stats.total).toBe(3);
    });

    it('devrait calculer la durée totale', () => {
      const meetings: ClassifiedMeeting[] = [
        createMeeting('1', MeetingColor.RED, 60),
        createMeeting('2', MeetingColor.GREEN, 30),
        createMeeting('3', MeetingColor.BLUE, 120),
      ];

      const stats = service.calculateStatistics(meetings);

      expect(stats.totalDuration).toBe(210);
    });

    it('devrait calculer la durée moyenne', () => {
      const meetings: ClassifiedMeeting[] = [
        createMeeting('1', MeetingColor.RED, 60),
        createMeeting('2', MeetingColor.GREEN, 30),
        createMeeting('3', MeetingColor.BLUE, 120),
      ];

      const stats = service.calculateStatistics(meetings);

      expect(stats.averageDuration).toBe(70);
    });

    it('devrait retourner des statistiques vides pour un tableau vide', () => {
      const stats = service.calculateStatistics([]);

      expect(stats.total).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.byColor.red).toBe(0);
      expect(stats.byColor.green).toBe(0);
      expect(stats.byColor.blue).toBe(0);
    });
  });

  describe('calculateCountByColor', () => {
    it('devrait calculer le nombre de réunions par couleur', () => {
      const meetings: ClassifiedMeeting[] = [
        createMeeting('1', MeetingColor.RED, 60),
        createMeeting('2', MeetingColor.RED, 60),
        createMeeting('3', MeetingColor.GREEN, 30),
        createMeeting('4', MeetingColor.BLUE, 120),
        createMeeting('5', MeetingColor.DEFAULT, 45),
      ];

      const counts = service.calculateCountByColor(meetings);

      expect(counts.red).toBe(2);
      expect(counts.green).toBe(1);
      expect(counts.blue).toBe(1);
      expect(counts.default).toBe(1);
    });
  });

  describe('calculateStatistics - fréquences', () => {
    it('devrait calculer la fréquence hebdomadaire', () => {
      const startDate = new Date('2024-01-01');
      const meetings: ClassifiedMeeting[] = Array.from({ length: 20 }, (_, i) =>
        createMeeting(
          `meeting-${i}`,
          MeetingColor.RED,
          60,
          new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
        )
      );

      const stats = service.calculateStatistics(meetings);

      expect(stats.weeklyFrequency).toBeGreaterThan(0);
    });
  });

  // Helper function
  function createMeeting(
    id: string,
    color: MeetingColor,
    duration: number,
    start?: Date
  ): ClassifiedMeeting {
    const startDate = start || new Date('2024-01-15T09:00:00');
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    return {
      id,
      subject: `Réunion ${id}`,
      start: startDate,
      end: endDate,
      duration,
      color,
      classificationReason: `Test ${color}`,
    };
  }
});

