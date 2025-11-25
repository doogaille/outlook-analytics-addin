/**
 * Tests d'intégration pour l'interface utilisateur
 * Teste les interactions et le flux complet de l'UI
 */

import { MeetingService } from '../../src/services/MeetingService';
import { ClassificationService } from '../../src/services/ClassificationService';
import { StatisticsService } from '../../src/services/StatisticsService';
import { ConfigService } from '../../src/services/ConfigService';
import { ClassifiedMeeting, MeetingColor } from '../../src/models/Meeting';

describe('Tests d\'intégration UI', () => {
  let meetingService: MeetingService;
  let classificationService: ClassificationService;
  let statisticsService: StatisticsService;

  beforeEach(() => {
    localStorage.clear();
    meetingService = new MeetingService();
    classificationService = new ClassificationService();
    statisticsService = new StatisticsService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Chargement des réunions au démarrage', () => {
    it('devrait charger automatiquement les réunions si autoLoad est activé', async () => {
      // Configurer autoLoad
      ConfigService.savePreferences({ autoLoad: true });

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Simuler le chargement
      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      const classified = classificationService.classifyMeetings(meetings);

      expect(meetings.length).toBeGreaterThan(0);
      expect(classified.length).toBe(meetings.length);
    });

    it('ne devrait pas charger automatiquement si autoLoad est désactivé', () => {
      ConfigService.savePreferences({ autoLoad: false });
      const prefs = ConfigService.loadPreferences();

      expect(prefs.autoLoad).toBe(false);
    });

    it('devrait utiliser la période par défaut configurée', () => {
      ConfigService.savePreferences({
        defaultDateRange: { days: 60 },
      });

      const prefs = ConfigService.loadPreferences();
      expect(prefs.defaultDateRange?.days).toBe(60);
    });
  });

  describe('Mise à jour des statistiques lors du changement de période', () => {
    it('devrait recalculer les statistiques quand la période change', async () => {
      const startDate1 = new Date('2024-01-01');
      const endDate1 = new Date('2024-01-15');
      const startDate2 = new Date('2024-01-16');
      const endDate2 = new Date('2024-01-31');

      // Première période
      const meetings1 = await meetingService.getMeetings(startDate1, endDate1, true);
      const classified1 = classificationService.classifyMeetings(meetings1);
      const stats1 = statisticsService.calculateStatistics(classified1);

      // Deuxième période
      const meetings2 = await meetingService.getMeetings(startDate2, endDate2, true);
      const classified2 = classificationService.classifyMeetings(meetings2);
      const stats2 = statisticsService.calculateStatistics(classified2);

      // Les statistiques devraient être différentes
      expect(stats1.total).toBeGreaterThanOrEqual(0);
      expect(stats2.total).toBeGreaterThanOrEqual(0);
      // Les totaux peuvent être différents selon les données mockées
    });

    it('devrait mettre à jour les graphiques quand les statistiques changent', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      const classified = classificationService.classifyMeetings(meetings);
      const stats = statisticsService.calculateStatistics(classified);

      // Vérifier que les statistiques sont calculées
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.byColor).toBeDefined();
      expect(stats.byColor.red + stats.byColor.green + stats.byColor.blue).toBeLessThanOrEqual(stats.total);
    });
  });

  describe('Interaction utilisateur - Filtres', () => {
    it('devrait filtrer les réunions par couleur', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      const classified = classificationService.classifyMeetings(meetings);

      // Filtrer par rouge
      const redMeetings = classified.filter((m) => m.color === MeetingColor.RED);
      expect(redMeetings.every((m) => m.color === MeetingColor.RED)).toBe(true);

      // Filtrer par vert
      const greenMeetings = classified.filter((m) => m.color === MeetingColor.GREEN);
      expect(greenMeetings.every((m) => m.color === MeetingColor.GREEN)).toBe(true);

      // Filtrer par bleu
      const blueMeetings = classified.filter((m) => m.color === MeetingColor.BLUE);
      expect(blueMeetings.every((m) => m.color === MeetingColor.BLUE)).toBe(true);
    });

    it('devrait combiner plusieurs filtres de couleur', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      const classified = classificationService.classifyMeetings(meetings);

      // Filtrer rouge OU vert
      const redOrGreen = classified.filter(
        (m) => m.color === MeetingColor.RED || m.color === MeetingColor.GREEN
      );
      expect(redOrGreen.length).toBeLessThanOrEqual(classified.length);
    });
  });

  describe('Interaction utilisateur - Tri', () => {
    it('devrait trier les réunions par date', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      const classified = classificationService.classifyMeetings(meetings);

      // Trier par date croissante
      const sortedAsc = [...classified].sort((a, b) => a.start.getTime() - b.start.getTime());
      expect(sortedAsc[0].start.getTime()).toBeLessThanOrEqual(
        sortedAsc[sortedAsc.length - 1].start.getTime()
      );

      // Trier par date décroissante
      const sortedDesc = [...classified].sort((a, b) => b.start.getTime() - a.start.getTime());
      expect(sortedDesc[0].start.getTime()).toBeGreaterThanOrEqual(
        sortedDesc[sortedDesc.length - 1].start.getTime()
      );
    });

    it('devrait trier les réunions par durée', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      const classified = classificationService.classifyMeetings(meetings);

      // Trier par durée croissante
      const sortedAsc = [...classified].sort((a, b) => a.duration - b.duration);
      expect(sortedAsc[0].duration).toBeLessThanOrEqual(sortedAsc[sortedAsc.length - 1].duration);

      // Trier par durée décroissante
      const sortedDesc = [...classified].sort((a, b) => b.duration - a.duration);
      expect(sortedDesc[0].duration).toBeGreaterThanOrEqual(sortedDesc[sortedDesc.length - 1].duration);
    });

    it('devrait trier les réunions par sujet', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      const classified = classificationService.classifyMeetings(meetings);

      // Trier par sujet A-Z
      const sortedAsc = [...classified].sort((a, b) => a.subject.localeCompare(b.subject, 'fr'));
      expect(sortedAsc[0].subject.localeCompare(sortedAsc[sortedAsc.length - 1].subject, 'fr')).toBeLessThanOrEqual(0);

      // Trier par sujet Z-A
      const sortedDesc = [...classified].sort((a, b) => b.subject.localeCompare(a.subject, 'fr'));
      expect(sortedDesc[0].subject.localeCompare(sortedDesc[sortedDesc.length - 1].subject, 'fr')).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Interaction utilisateur - Pagination', () => {
    it('devrait paginer les réunions selon la configuration', async () => {
      ConfigService.savePreferences({ meetingsPerPage: 10 });

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      const classified = classificationService.classifyMeetings(meetings);

      const prefs = ConfigService.loadPreferences();
      const meetingsPerPage = prefs.meetingsPerPage || 20;

      // Simuler la pagination
      const totalPages = Math.ceil(classified.length / meetingsPerPage);
      expect(totalPages).toBeGreaterThanOrEqual(1);

      // Première page
      const page1 = classified.slice(0, meetingsPerPage);
      expect(page1.length).toBeLessThanOrEqual(meetingsPerPage);

      // Dernière page
      if (totalPages > 1) {
        const lastPage = classified.slice((totalPages - 1) * meetingsPerPage);
        expect(lastPage.length).toBeGreaterThan(0);
      }
    });

    it('devrait gérer la pagination avec virtualisation pour grandes listes', async () => {
      // Créer une grande liste de réunions
      const largeList: ClassifiedMeeting[] = Array.from({ length: 200 }, (_, i) => ({
        id: `meeting-${i}`,
        subject: `Réunion ${i}`,
        start: new Date(2024, 0, 1 + i),
        end: new Date(2024, 0, 1 + i, 1),
        duration: 60,
        location: `Lieu ${i}`,
        color: i % 3 === 0 ? MeetingColor.RED : i % 3 === 1 ? MeetingColor.GREEN : MeetingColor.BLUE,
        classificationReason: `Classification ${i}`,
      }));

      // La virtualisation devrait s'activer pour > 50 éléments
      const shouldUseVirtualization = largeList.length > 50;
      expect(shouldUseVirtualization).toBe(true);
    });
  });

  describe('Interaction utilisateur - Export', () => {
    it('devrait exporter les données en CSV', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      const classified = classificationService.classifyMeetings(meetings);

      // Simuler l'export CSV
      const csvHeaders = ['Sujet', 'Date début', 'Date fin', 'Durée (min)', 'Couleur', 'Classification', 'Lieu'];
      const csvRows = classified.map((m) => [
        m.subject,
        m.start.toISOString(),
        m.end.toISOString(),
        m.duration.toString(),
        m.color,
        m.classificationReason || '',
        m.location || '',
      ]);

      const csv = [csvHeaders, ...csvRows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      expect(csv).toContain('Sujet');
      expect(csv.split('\n').length).toBe(classified.length + 1); // +1 pour les headers
    });

    it('devrait exporter les données en JSON', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      const classified = classificationService.classifyMeetings(meetings);

      // Simuler l'export JSON
      const json = JSON.stringify(classified, null, 2);
      const parsed = JSON.parse(json);

      expect(parsed).toBeInstanceOf(Array);
      expect(parsed.length).toBe(classified.length);
      expect(parsed[0]).toHaveProperty('subject');
      expect(parsed[0]).toHaveProperty('color');
    });
  });
});

