import { ClassifiedMeeting, MeetingColor } from '../../src/models/Meeting';

/**
 * Fonction de tri pour les tests (copie de la fonction dans taskpane.ts)
 */
function sortMeetings(meetings: ClassifiedMeeting[], sortBy: string): ClassifiedMeeting[] {
  const sorted = [...meetings];

  switch (sortBy) {
    case 'date-asc':
      sorted.sort((a, b) => a.start.getTime() - b.start.getTime());
      break;
    case 'date-desc':
      sorted.sort((a, b) => b.start.getTime() - a.start.getTime());
      break;
    case 'duration-asc':
      sorted.sort((a, b) => a.duration - b.duration);
      break;
    case 'duration-desc':
      sorted.sort((a, b) => b.duration - a.duration);
      break;
    case 'subject-asc':
      sorted.sort((a, b) => a.subject.localeCompare(b.subject, 'fr'));
      break;
    case 'subject-desc':
      sorted.sort((a, b) => b.subject.localeCompare(a.subject, 'fr'));
      break;
  }

  return sorted;
}

describe('Tri des réunions', () => {
  const createMeeting = (
    subject: string,
    start: Date,
    duration: number,
    color: MeetingColor = MeetingColor.DEFAULT
  ): ClassifiedMeeting => ({
    id: `test-${subject}`,
    subject,
    start,
    end: new Date(start.getTime() + duration * 60 * 1000),
    duration,
    color,
    classificationReason: 'Test',
  });

  const meetings: ClassifiedMeeting[] = [
    createMeeting('Réunion C', new Date('2024-01-15T10:00:00'), 60),
    createMeeting('Réunion A', new Date('2024-01-10T10:00:00'), 30),
    createMeeting('Réunion B', new Date('2024-01-20T10:00:00'), 90),
  ];

  it('devrait trier par date croissante', () => {
    const sorted = sortMeetings(meetings, 'date-asc');
    expect(sorted[0].subject).toBe('Réunion A');
    expect(sorted[1].subject).toBe('Réunion C');
    expect(sorted[2].subject).toBe('Réunion B');
  });

  it('devrait trier par date décroissante', () => {
    const sorted = sortMeetings(meetings, 'date-desc');
    expect(sorted[0].subject).toBe('Réunion B');
    expect(sorted[1].subject).toBe('Réunion C');
    expect(sorted[2].subject).toBe('Réunion A');
  });

  it('devrait trier par durée croissante', () => {
    const sorted = sortMeetings(meetings, 'duration-asc');
    expect(sorted[0].duration).toBe(30);
    expect(sorted[1].duration).toBe(60);
    expect(sorted[2].duration).toBe(90);
  });

  it('devrait trier par durée décroissante', () => {
    const sorted = sortMeetings(meetings, 'duration-desc');
    expect(sorted[0].duration).toBe(90);
    expect(sorted[1].duration).toBe(60);
    expect(sorted[2].duration).toBe(30);
  });

  it('devrait trier par sujet A-Z', () => {
    const sorted = sortMeetings(meetings, 'subject-asc');
    expect(sorted[0].subject).toBe('Réunion A');
    expect(sorted[1].subject).toBe('Réunion B');
    expect(sorted[2].subject).toBe('Réunion C');
  });

  it('devrait trier par sujet Z-A', () => {
    const sorted = sortMeetings(meetings, 'subject-desc');
    expect(sorted[0].subject).toBe('Réunion C');
    expect(sorted[1].subject).toBe('Réunion B');
    expect(sorted[2].subject).toBe('Réunion A');
  });
});

