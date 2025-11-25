/**
 * Service de configuration et préférences utilisateur
 */
export interface UserPreferences {
  classificationRules?: {
    noFlex?: {
      keywords?: string[];
      patterns?: string[];
    };
    flex?: {
      keywords?: string[];
      patterns?: string[];
    };
    deplacement?: {
      keywords?: string[];
      patterns?: string[];
    };
  };
  defaultDateRange?: {
    days?: number; // Nombre de jours par défaut (ex: 30)
  };
  meetingsPerPage?: number;
  autoLoad?: boolean;
  theme?: 'light' | 'dark';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultDateRange: {
    days: 30,
  },
  meetingsPerPage: 20,
  autoLoad: false,
  theme: 'light',
};

const STORAGE_KEY = 'outlook-analytics-preferences';

export class ConfigService {
  /**
   * Charge les préférences utilisateur depuis localStorage
   */
  static loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des préférences:', error);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  /**
   * Sauvegarde les préférences utilisateur dans localStorage
   */
  static savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      throw new Error('Impossible de sauvegarder les préférences');
    }
  }

  /**
   * Met à jour une partie des préférences
   */
  static updatePreferences(updates: Partial<UserPreferences>): void {
    const current = this.loadPreferences();
    const updated = { ...current, ...updates };
    this.savePreferences(updated);
  }

  /**
   * Réinitialise les préférences aux valeurs par défaut
   */
  static resetPreferences(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
    }
  }

  /**
   * Récupère une préférence spécifique
   */
  static getPreference<K extends keyof UserPreferences>(
    key: K
  ): UserPreferences[K] | undefined {
    const prefs = this.loadPreferences();
    return prefs[key];
  }

  /**
   * Définit une préférence spécifique
   */
  static setPreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    this.updatePreferences({ [key]: value } as Partial<UserPreferences>);
  }
}

