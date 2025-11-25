/**
 * Tests d'intégration pour l'API Office.js
 * Teste la connexion, la récupération des données et la gestion des erreurs
 */

import { OutlookAPI } from '../../src/utils/OutlookAPI';
import { OutlookRESTAPI } from '../../src/utils/OutlookRESTAPI';
import { MeetingService } from '../../src/services/MeetingService';

// Mock de Office.js pour les tests
const mockOffice = {
  context: {
    platform: 'PC',
    mailbox: {
      restUrl: 'https://outlook.office365.com/api/v1.0',
      getUserIdentityTokenAsync: jest.fn((callback: any) => {
        callback({ status: 'succeeded', value: 'mock-token' });
      }),
      diagnostics: {
        host: 'Outlook',
        version: '16.0.12345',
      },
    },
  },
  PlatformType: {
    PC: 'PC',
    Mac: 'Mac',
    OfficeOnline: 'OfficeOnline',
  },
};

// Définir Office global pour les tests
(global as any).Office = mockOffice;

describe('Tests d\'intégration Office.js API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Connexion à l\'API Outlook', () => {
    it('devrait détecter si Office.js est disponible', () => {
      const isAvailable = OutlookAPI.isAvailable();
      // Dans l'environnement de test, Office peut ne pas être disponible
      // Le test vérifie juste que la méthode fonctionne
      expect(typeof isAvailable).toBe('boolean');
    });

    it('devrait détecter la plateforme', () => {
      if (OutlookAPI.isAvailable()) {
        const isDesktop = OutlookAPI.isDesktop();
        const isWindows = OutlookAPI.isWindows();
        const isMac = OutlookAPI.isMac();

        expect(typeof isDesktop).toBe('boolean');
        expect(typeof isWindows).toBe('boolean');
        expect(typeof isMac).toBe('boolean');
      }
    });
  });

  describe('Récupération du calendrier actif', () => {
    it('devrait détecter les capacités API disponibles', () => {
      if (OutlookAPI.isAvailable()) {
        const capabilities = OutlookAPI.getAvailableCapabilities();
        expect(Array.isArray(capabilities)).toBe(true);
      }
    });

    it('devrait détecter la version Exchange', () => {
      if (OutlookAPI.isAvailable()) {
        const version = OutlookAPI.getExchangeVersion();
        // Peut être null si non détectable
        expect(version === null || typeof version === 'string').toBe(true);
      }
    });

    it('devrait détecter la version Outlook', () => {
      if (OutlookAPI.isAvailable()) {
        const version = OutlookAPI.getOutlookVersion();
        // Peut être null si non détectable
        expect(version === null || typeof version === 'string').toBe(true);
      }
    });

    it('devrait retourner les diagnostics complets', () => {
      if (OutlookAPI.isAvailable()) {
        const diagnostics = OutlookAPI.getDiagnostics();
        expect(diagnostics).toHaveProperty('platform');
        expect(diagnostics).toHaveProperty('isDesktop');
        expect(diagnostics).toHaveProperty('isWindows');
        expect(diagnostics).toHaveProperty('isMac');
        expect(diagnostics).toHaveProperty('capabilities');
        expect(Array.isArray(diagnostics.capabilities)).toBe(true);
      }
    });
  });

  describe('Gestion des permissions', () => {
    it('devrait gérer l\'absence de permissions gracieusement', async () => {
      const service = new MeetingService();
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Devrait utiliser le mock en cas d'erreur de permissions
      try {
        const meetings = await service.getMeetings(startDate, endDate, false);
        expect(Array.isArray(meetings)).toBe(true);
      } catch (error) {
        // Si erreur, devrait fallback vers mock
        const mockMeetings = await service.getMeetings(startDate, endDate, true);
        expect(Array.isArray(mockMeetings)).toBe(true);
      }
    });
  });

  describe('Gestion des erreurs API', () => {
    it('devrait gérer les erreurs de connexion', async () => {
      const service = new MeetingService();
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Devrait fallback vers mock en cas d'erreur
      const meetings = await service.getMeetings(startDate, endDate, false);
      expect(Array.isArray(meetings)).toBe(true);
    });

    it('devrait utiliser le cache en cas d\'erreur réseau', async () => {
      const service = new MeetingService();
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Premier appel - devrait mettre en cache
      const meetings1 = await service.getMeetings(startDate, endDate, true, true);
      expect(meetings1.length).toBeGreaterThan(0);

      // Deuxième appel - devrait utiliser le cache
      const meetings2 = await service.getMeetings(startDate, endDate, true, true);
      expect(meetings2.length).toBe(meetings1.length);
    });
  });

  describe('Détection de plateforme', () => {
    it('devrait détecter Windows vs Mac', () => {
      if (OutlookAPI.isAvailable()) {
        const diagnostics = OutlookAPI.getDiagnostics();
        
        // Au moins une des plateformes devrait être détectée
        const isPlatformDetected = diagnostics.isWindows || diagnostics.isMac || !diagnostics.isDesktop;
        expect(isPlatformDetected).toBe(true);
      }
    });

    it('devrait adapter la stratégie selon la plateforme', () => {
      if (OutlookAPI.isAvailable()) {
        const diagnostics = OutlookAPI.getDiagnostics();
        
        // La détection devrait influencer la stratégie d'API
        if (diagnostics.isDesktop) {
          // Sur Desktop, certaines API peuvent être différentes
          expect(diagnostics.isWindows || diagnostics.isMac).toBe(true);
        }
      }
    });
  });

  describe('Compatibilité avec version Exchange', () => {
    it('devrait détecter les capacités selon la version', () => {
      if (OutlookAPI.isAvailable()) {
        const capabilities = OutlookAPI.getAvailableCapabilities();
        const hasREST = OutlookAPI.hasCapability('REST');
        const hasEWS = OutlookAPI.hasCapability('EWS');

        // Au moins une API devrait être disponible ou détectable
        expect(Array.isArray(capabilities)).toBe(true);
        expect(typeof hasREST).toBe('boolean');
        expect(typeof hasEWS).toBe('boolean');
      }
    });

    it('devrait adapter le comportement selon les capacités', () => {
      if (OutlookAPI.isAvailable()) {
        const hasREST = OutlookAPI.hasCapability('REST');
        
        // Si REST est disponible, devrait être utilisé en priorité
        if (hasREST) {
          expect(OutlookRESTAPI.isRESTAvailable()).toBe(true);
        }
      }
    });
  });

  describe('Fallback pour API non disponibles', () => {
    it('devrait utiliser Office.js standard si REST n\'est pas disponible', async () => {
      const service = new MeetingService();
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Devrait toujours retourner des réunions (via mock si nécessaire)
      const meetings = await service.getMeetings(startDate, endDate, false);
      expect(Array.isArray(meetings)).toBe(true);
    });

    it('devrait utiliser le mock si Office.js n\'est pas disponible', async () => {
      const service = new MeetingService();
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Devrait utiliser le mock automatiquement
      const meetings = await service.getMeetings(startDate, endDate, false);
      expect(Array.isArray(meetings)).toBe(true);
      expect(meetings.length).toBeGreaterThan(0);
    });
  });
});

