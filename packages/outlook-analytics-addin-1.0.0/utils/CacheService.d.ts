/**
 * Service de mise en cache pour les données de réunions
 */
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresIn: number;
}
export declare class CacheService {
    /**
     * Récupère une entrée du cache
     */
    static get<T>(key: string): T | null;
    /**
     * Stocke une entrée dans le cache
     */
    static set<T>(key: string, data: T, expiresIn?: number): void;
    /**
     * Supprime une entrée du cache
     */
    static remove(key: string): void;
    /**
     * Vide tout le cache
     */
    static clear(): void;
    /**
     * Nettoie les entrées expirées
     */
    static clearExpired(): void;
    /**
     * Génère une clé de cache pour une période de dates
     */
    static generateKey(prefix: string, startDate: Date, endDate: Date): string;
}
//# sourceMappingURL=CacheService.d.ts.map