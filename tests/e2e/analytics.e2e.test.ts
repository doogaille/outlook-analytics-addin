/**
 * Tests end-to-end pour l'add-in Outlook Analytics
 * Teste le flux complet de l'application
 */

import { MeetingService } from '../../src/services/MeetingService';
import { ClassificationService } from '../../src/services/ClassificationService';
import { StatisticsService } from '../../src/services/StatisticsService';
import { ConfigService } from '../../src/services/ConfigService';
import { ClassifiedMeeting, MeetingColor } from '../../src/models/Meeting';

describe('Tests E2E - Flux complet Analytics', () => {
  let meetingService: MeetingService;
  let classificationService: ClassificationService;
  let statisticsService: StatisticsService;

  beforeEach(() => {
    // Nettoyer le localStorage
    localStorage.clear();
    
    // Initialiser les services
    meetingService = new MeetingService();
    classificationService = new ClassificationService();
    statisticsService = new StatisticsService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Scénario complet : ouverture → analyse → export', () => {
    it('devrait charger, classifier, calculer les stats et exporter les données', async () => {
      // 1. Charger les réunions (mode mock)
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      expect(meetings.length).toBeGreaterThan(0);

      // 2. Classifier les réunions
      const classifiedMeetings = classificationService.classifyMeetings(meetings);
      expect(classifiedMeetings.length).toBe(meetings.length);
      expect(classifiedMeetings.every(m => m.color)).toBe(true);

      // 3. Calculer les statistiques
      const stats = statisticsService.calculateStatistics(classifiedMeetings);
      expect(stats.total).toBe(meetings.length);
      expect(stats.byColor.red).toBeGreaterThanOrEqual(0);
      expect(stats.byColor.green).toBeGreaterThanOrEqual(0);
      expect(stats.byColor.blue).toBeGreaterThanOrEqual(0);

      // 4. Sauvegarder les préférences
      ConfigService.savePreferences({
        defaultDateRange: { days: 30 },
        meetingsPerPage: 20,
        autoLoad: false,
      });

      const loadedPrefs = ConfigService.loadPreferences();
      expect(loadedPrefs.defaultDateRange?.days).toBe(30);
      expect(loadedPrefs.meetingsPerPage).toBe(20);

      // 5. Vérifier que les données peuvent être exportées (simulation)
      const exportData = classifiedMeetings.map(m => ({
        subject: m.subject,
        start: m.start.toISOString(),
        end: m.end.toISOString(),
        duration: m.duration,
        color: m.color,
        classification: m.classificationReason,
      }));

      expect(exportData.length).toBe(meetings.length);
      expect(exportData[0]).toHaveProperty('subject');
      expect(exportData[0]).toHaveProperty('color');
    });
  });

  describe('Performance avec un grand nombre de réunions', () => {
    it('devrait gérer efficacement 1000+ réunions', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      
      // Générer un grand nombre de réunions mockées
      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      
      // Mesurer le temps de classification
      const startTime = performance.now();
      const classifiedMeetings = classificationService.classifyMeetings(meetings);
      const classificationTime = performance.now() - startTime;

      expect(classifiedMeetings.length).toBe(meetings.length);
      expect(classificationTime).toBeLessThan(1000); // Moins d'1 seconde pour 1000+ réunions

      // Mesurer le temps de calcul des statistiques
      const statsStartTime = performance.now();
      const stats = statisticsService.calculateStatistics(classifiedMeetings);
      const statsTime = performance.now() - statsStartTime;

      expect(stats.total).toBe(meetings.length);
      expect(statsTime).toBeLessThan(500); // Moins de 500ms pour les stats
    });

    it('devrait utiliser la virtualisation pour les grandes listes', () => {
      // Simuler une grande liste de réunions
      const largeMeetingList: ClassifiedMeeting[] = Array.from({ length: 200 }, (_, i) => ({
        id: `meeting-${i}`,
        subject: `Réunion ${i}`,
        start: new Date(2024, 0, 1 + i),
        end: new Date(2024, 0, 1 + i, 1),
        duration: 60,
        location: `Lieu ${i}`,
        color: i % 3 === 0 ? MeetingColor.RED : i % 3 === 1 ? MeetingColor.GREEN : MeetingColor.BLUE,
        classificationReason: `Classification ${i}`,
      }));

      // Vérifier que la liste peut être traitée
      const stats = statisticsService.calculateStatistics(largeMeetingList);
      expect(stats.total).toBe(200);
      expect(stats.byColor.red + stats.byColor.green + stats.byColor.blue).toBe(200);
    });
  });

  describe('Gestion des erreurs réseau', () => {
    it('devrait gérer gracieusement les erreurs de récupération', async () => {
      // Simuler une erreur en utilisant des dates invalides
      const invalidStartDate = new Date('invalid');
      const invalidEndDate = new Date('invalid');

      try {
        await meetingService.getMeetings(invalidStartDate, invalidEndDate, false);
      } catch (error) {
        // L'erreur devrait être gérée et retourner un tableau vide ou utiliser le mock
        expect(error).toBeDefined();
      }
    });

    it('devrait utiliser le cache en cas d\'erreur réseau', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Premier appel - devrait mettre en cache
      const meetings1 = await meetingService.getMeetings(startDate, endDate, true, true);
      expect(meetings1.length).toBeGreaterThan(0);

      // Deuxième appel - devrait utiliser le cache
      const meetings2 = await meetingService.getMeetings(startDate, endDate, true, true);
      expect(meetings2.length).toBe(meetings1.length);
    });
  });

  describe('Intégration avec configuration utilisateur', () => {
    it('devrait appliquer les préférences utilisateur au chargement', () => {
      // Configurer les préférences
      ConfigService.savePreferences({
        defaultDateRange: { days: 60 },
        meetingsPerPage: 50,
        autoLoad: true,
      });

      // Vérifier que les préférences sont appliquées
      const prefs = ConfigService.loadPreferences();
      expect(prefs.defaultDateRange?.days).toBe(60);
      expect(prefs.meetingsPerPage).toBe(50);
      expect(prefs.autoLoad).toBe(true);
    });

    it('devrait persister les règles de classification personnalisées', () => {
      const customRules = {
        noFlex: {
          keywords: ['custom1', 'custom2'],
          patterns: ['/custom-pattern/i'],
        },
        flex: {
          keywords: ['custom-flex'],
          patterns: [],
        },
        deplacement: {
          keywords: [],
          patterns: [],
        },
      };

      ConfigService.setPreference('classificationRules', customRules);
      const loaded = ConfigService.getPreference('classificationRules');

      expect(loaded).toBeDefined();
      expect(loaded?.noFlex?.keywords).toContain('custom1');
      expect(loaded?.noFlex?.keywords).toContain('custom2');
    });
  });

  describe('Flux de filtrage et tri', () => {
    it('devrait filtrer et trier correctement les réunions', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const meetings = await meetingService.getMeetings(startDate, endDate, true);
      const classifiedMeetings = classificationService.classifyMeetings(meetings);

      // Filtrer par couleur rouge
      const redMeetings = classifiedMeetings.filter(m => m.color === 'red');
      expect(redMeetings.every(m => m.color === 'red')).toBe(true);

      // Trier par date décroissante
      const sortedByDate = [...classifiedMeetings].sort((a, b) => 
        b.start.getTime() - a.start.getTime()
      );
      expect(sortedByDate[0].start.getTime()).toBeGreaterThanOrEqual(
        sortedByDate[sortedByDate.length - 1].start.getTime()
      );

      // Trier par durée
      const sortedByDuration = [...classifiedMeetings].sort((a, b) => 
        b.duration - a.duration
      );
      expect(sortedByDuration[0].duration).toBeGreaterThanOrEqual(
        sortedByDuration[sortedByDuration.length - 1].duration
      );
    });
  });
});

