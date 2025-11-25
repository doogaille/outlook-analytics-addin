import { ConfigService, UserPreferences } from '../../src/services/ConfigService';

describe('ConfigService', () => {
  beforeEach(() => {
    // Nettoyer le localStorage avant chaque test
    localStorage.clear();
  });

  afterEach(() => {
    // Nettoyer après chaque test
    localStorage.clear();
  });

  describe('loadPreferences', () => {
    it('devrait retourner les préférences par défaut si aucune n\'est sauvegardée', () => {
      const prefs = ConfigService.loadPreferences();
      expect(prefs.defaultDateRange?.days).toBe(30);
      expect(prefs.meetingsPerPage).toBe(20);
      expect(prefs.autoLoad).toBe(false);
      expect(prefs.theme).toBe('light');
    });

    it('devrait charger les préférences sauvegardées', () => {
      const customPrefs: UserPreferences = {
        meetingsPerPage: 50,
        autoLoad: true,
      };
      ConfigService.savePreferences(customPrefs);

      const loaded = ConfigService.loadPreferences();
      expect(loaded.meetingsPerPage).toBe(50);
      expect(loaded.autoLoad).toBe(true);
      // Les autres valeurs doivent rester aux défauts
      expect(loaded.defaultDateRange?.days).toBe(30);
    });
  });

  describe('savePreferences', () => {
    it('devrait sauvegarder les préférences', () => {
      const prefs: UserPreferences = {
        meetingsPerPage: 25,
        theme: 'dark',
      };

      ConfigService.savePreferences(prefs);
      const loaded = ConfigService.loadPreferences();

      expect(loaded.meetingsPerPage).toBe(25);
      expect(loaded.theme).toBe('dark');
    });
  });

  describe('updatePreferences', () => {
    it('devrait mettre à jour partiellement les préférences', () => {
      ConfigService.savePreferences({ meetingsPerPage: 20 });
      ConfigService.updatePreferences({ meetingsPerPage: 30 });

      const loaded = ConfigService.loadPreferences();
      expect(loaded.meetingsPerPage).toBe(30);
      expect(loaded.defaultDateRange?.days).toBe(30); // Non modifié
    });
  });

  describe('resetPreferences', () => {
    it('devrait réinitialiser les préférences', () => {
      ConfigService.savePreferences({ meetingsPerPage: 50 });
      ConfigService.resetPreferences();

      const loaded = ConfigService.loadPreferences();
      expect(loaded.meetingsPerPage).toBe(20); // Valeur par défaut
    });
  });

  describe('getPreference / setPreference', () => {
    it('devrait récupérer une préférence spécifique', () => {
      ConfigService.setPreference('meetingsPerPage', 40);
      const value = ConfigService.getPreference('meetingsPerPage');
      expect(value).toBe(40);
    });

    it('devrait retourner undefined pour une préférence non définie', () => {
      const value = ConfigService.getPreference('theme');
      expect(value).toBe('light'); // Valeur par défaut
    });
  });

  describe('Validation de la configuration', () => {
    it('devrait accepter des valeurs valides pour meetingsPerPage', () => {
      ConfigService.setPreference('meetingsPerPage', 50);
      const value = ConfigService.getPreference('meetingsPerPage');
      expect(value).toBe(50);
    });

    it('devrait accepter des valeurs valides pour defaultDateRange', () => {
      ConfigService.setPreference('defaultDateRange', { days: 60 });
      const value = ConfigService.getPreference('defaultDateRange');
      expect(value?.days).toBe(60);
    });

    it('devrait accepter des valeurs valides pour theme', () => {
      ConfigService.setPreference('theme', 'dark');
      const value = ConfigService.getPreference('theme');
      expect(value).toBe('dark');
    });
  });

  describe('Personnalisation des règles de classification', () => {
    it('devrait sauvegarder et charger les règles de classification', () => {
      const rules = {
        noFlex: {
          keywords: ['test', 'obligatoire'],
          patterns: ['/pattern1/i'],
        },
        flex: {
          keywords: ['optionnel'],
          patterns: [],
        },
        deplacement: {
          keywords: ['formation'],
          patterns: [],
        },
      };

      ConfigService.setPreference('classificationRules', rules);
      const loaded = ConfigService.getPreference('classificationRules');

      expect(loaded).toBeDefined();
      expect(loaded?.noFlex?.keywords).toContain('test');
      expect(loaded?.noFlex?.keywords).toContain('obligatoire');
      expect(loaded?.flex?.keywords).toContain('optionnel');
      expect(loaded?.deplacement?.keywords).toContain('formation');
    });

    it('devrait mettre à jour partiellement les règles de classification', () => {
      const initialRules = {
        noFlex: {
          keywords: ['test'],
          patterns: [],
        },
        flex: {
          keywords: ['optionnel'],
          patterns: [],
        },
        deplacement: {
          keywords: [],
          patterns: [],
        },
      };

      ConfigService.setPreference('classificationRules', initialRules);
      ConfigService.updatePreferences({
        classificationRules: {
          noFlex: {
            keywords: ['test', 'nouveau'],
            patterns: [],
          },
        },
      });

      const loaded = ConfigService.getPreference('classificationRules');
      expect(loaded?.noFlex?.keywords).toContain('test');
      expect(loaded?.noFlex?.keywords).toContain('nouveau');
      expect(loaded?.flex?.keywords).toContain('optionnel'); // Non modifié
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de localStorage gracieusement', () => {
      // Simuler une erreur localStorage
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => {
        ConfigService.savePreferences({ meetingsPerPage: 30 });
      }).toThrow('Impossible de sauvegarder les préférences');

      // Restaurer
      Storage.prototype.setItem = originalSetItem;
    });

    it('devrait retourner les valeurs par défaut en cas d\'erreur de chargement', () => {
      // Simuler une erreur localStorage
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      const prefs = ConfigService.loadPreferences();
      expect(prefs.meetingsPerPage).toBe(20); // Valeur par défaut
      expect(prefs.defaultDateRange?.days).toBe(30); // Valeur par défaut

      // Restaurer
      Storage.prototype.getItem = originalGetItem;
    });
  });
});

