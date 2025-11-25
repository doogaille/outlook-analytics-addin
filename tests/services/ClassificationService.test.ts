import { ClassificationService } from '../../src/services/ClassificationService';
import { Meeting, MeetingColor } from '../../src/models/Meeting';

describe('ClassificationService', () => {
  let service: ClassificationService;

  beforeEach(() => {
    service = new ClassificationService();
  });

  describe('classifyMeeting', () => {
    it('devrait classifier une réunion "no flex" (rouge)', () => {
      const meeting: Meeting = {
        id: '1',
        subject: 'Réunion de direction obligatoire',
        start: new Date('2024-01-15'),
        end: new Date('2024-01-15T10:00:00'),
        duration: 60,
      };

      const classified = service.classifyMeeting(meeting);

      expect(classified.color).toBe(MeetingColor.RED);
      expect(classified.classificationReason).toContain('No Flex');
    });

    it('devrait classifier une réunion "flex" (vert)', () => {
      const meeting: Meeting = {
        id: '2',
        subject: 'Stand-up optionnel',
        start: new Date('2024-01-15'),
        end: new Date('2024-01-15T10:00:00'),
        duration: 30,
      };

      const classified = service.classifyMeeting(meeting);

      expect(classified.color).toBe(MeetingColor.GREEN);
      expect(classified.classificationReason).toContain('Flex');
    });

    it('devrait classifier une réunion "déplacement/formation" (bleu)', () => {
      const meeting: Meeting = {
        id: '3',
        subject: 'Formation client',
        start: new Date('2024-01-15'),
        end: new Date('2024-01-15T10:00:00'),
        duration: 120,
      };

      const classified = service.classifyMeeting(meeting);

      expect(classified.color).toBe(MeetingColor.BLUE);
      expect(classified.classificationReason).toContain('Déplacement/Formation');
    });

    it('devrait classifier une réunion sans critères (par défaut)', () => {
      const meeting: Meeting = {
        id: '4',
        subject: 'Réunion standard',
        start: new Date('2024-01-15'),
        end: new Date('2024-01-15T10:00:00'),
        duration: 45,
      };

      const classified = service.classifyMeeting(meeting);

      expect(classified.color).toBe(MeetingColor.DEFAULT);
      expect(classified.classificationReason).toBe('Non classifié');
    });

    it('devrait prioriser "no flex" sur "déplacement"', () => {
      const meeting: Meeting = {
        id: '5',
        subject: 'Réunion de direction obligatoire - Formation',
        start: new Date('2024-01-15'),
        end: new Date('2024-01-15T10:00:00'),
        duration: 60,
      };

      const classified = service.classifyMeeting(meeting);

      expect(classified.color).toBe(MeetingColor.RED);
    });

    it('devrait utiliser le corps du message pour la classification', () => {
      const meeting: Meeting = {
        id: '6',
        subject: 'Réunion',
        body: 'Cette réunion est obligatoire pour tous',
        start: new Date('2024-01-15'),
        end: new Date('2024-01-15T10:00:00'),
        duration: 60,
      };

      const classified = service.classifyMeeting(meeting);

      expect(classified.color).toBe(MeetingColor.RED);
    });
  });

  describe('classifyMeetings', () => {
    it('devrait classifier plusieurs réunions', () => {
      const meetings: Meeting[] = [
        {
          id: '1',
          subject: 'Réunion obligatoire',
          start: new Date('2024-01-15'),
          end: new Date('2024-01-15T10:00:00'),
          duration: 60,
        },
        {
          id: '2',
          subject: 'Stand-up',
          start: new Date('2024-01-16'),
          end: new Date('2024-01-16T10:00:00'),
          duration: 30,
        },
      ];

      const classified = service.classifyMeetings(meetings);

      expect(classified).toHaveLength(2);
      expect(classified[0].color).toBe(MeetingColor.RED);
      expect(classified[1].color).toBe(MeetingColor.GREEN);
    });
  });

  describe('updateRules', () => {
    it('devrait mettre à jour les règles de classification', () => {
      const newRules = {
        noFlex: {
          keywords: ['urgent'],
          patterns: [],
        },
      };

      service.updateRules(newRules);

      const meeting: Meeting = {
        id: '1',
        subject: 'Réunion urgente',
        start: new Date('2024-01-15'),
        end: new Date('2024-01-15T10:00:00'),
        duration: 60,
      };

      const classified = service.classifyMeeting(meeting);
      expect(classified.color).toBe(MeetingColor.RED);
    });
  });
});

