/**
 * Service de mise en cache pour les données de réunions
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // en millisecondes
}

const CACHE_PREFIX = 'outlook-analytics-cache-';
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class CacheService {
  /**
   * Récupère une entrée du cache
   */
  static get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      // Vérifier si le cache a expiré
      if (now > entry.timestamp + entry.expiresIn) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }

  /**
   * Stocke une entrée dans le cache
   */
  static set<T>(key: string, data: T, expiresIn: number = DEFAULT_CACHE_DURATION): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresIn,
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du cache:', error);
      // Si le localStorage est plein, nettoyer les anciennes entrées
      this.clearExpired();
    }
  }

  /**
   * Supprime une entrée du cache
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.warn('Erreur lors de la suppression du cache:', error);
    }
  }

  /**
   * Vide tout le cache
   */
  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erreur lors du nettoyage du cache:', error);
    }
  }

  /**
   * Nettoie les entrées expirées
   */
  static clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const entry: CacheEntry<any> = JSON.parse(cached);
              if (now > entry.timestamp + entry.expiresIn) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // Ignorer les erreurs de parsing
          }
        }
      });
    } catch (error) {
      console.warn('Erreur lors du nettoyage des entrées expirées:', error);
    }
  }

  /**
   * Génère une clé de cache pour une période de dates
   */
  static generateKey(prefix: string, startDate: Date, endDate: Date): string {
    return `${prefix}-${startDate.toISOString()}-${endDate.toISOString()}`;
  }
}

