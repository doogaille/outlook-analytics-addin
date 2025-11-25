/**
 * Implémentation de l'API REST Outlook pour récupérer les réunions
 * Compatible avec Outlook on-premise via Exchange REST API
 *
 * Optimisations :
 * - Batching des requêtes pour grandes périodes
 * - Mise en cache des tokens
 * - Retry automatique en cas d'erreur
 */
export declare class OutlookRESTAPI {
    private static tokenCache;
    private static readonly TOKEN_CACHE_TTL;
    private static readonly BATCH_SIZE_DAYS;
    /**
     * Récupère les événements du calendrier via l'API REST Outlook
     * Optimisé avec batching pour les grandes périodes
     *
     * @param startDate - Date de début
     * @param endDate - Date de fin
     * @param accessToken - Token d'accès (optionnel, récupéré automatiquement si absent)
     * @returns Promise résolue avec la liste des événements
     */
    static getCalendarEvents(startDate: Date, endDate: Date, accessToken?: string): Promise<any[]>;
    /**
     * Récupère les événements par lots pour les grandes périodes
     *
     * @param startDate - Date de début
     * @param endDate - Date de fin
     * @param accessToken - Token d'accès
     * @returns Promise résolue avec tous les événements
     */
    private static getCalendarEventsBatched;
    /**
     * Récupère toutes les pages de résultats (pagination)
     *
     * @param events - Événements déjà récupérés
     * @param nextLink - Lien vers la page suivante
     * @param token - Token d'accès
     * @returns Promise résolue avec tous les événements
     */
    private static fetchAllPages;
    /**
     * Effectue une requête avec retry automatique
     *
     * @param url - URL à appeler
     * @param token - Token d'accès
     * @param maxRetries - Nombre maximum de tentatives (défaut: 3)
     * @returns Promise résolue avec la réponse
     */
    private static fetchWithRetry;
    /**
     * Récupère un token d'accès mis en cache ou en demande un nouveau
     *
     * @returns Promise résolue avec le token
     */
    private static getCachedAccessToken;
    /**
     * Récupère le token d'accès via Office.js
     */
    static getAccessToken(): Promise<string>;
    /**
     * Récupère l'URL REST de base
     */
    private static getRestUrl;
    /**
     * Vérifie si l'API REST est disponible
     */
    static isRESTAvailable(): boolean;
    /**
     * Récupère les événements avec gestion d'erreurs et fallback
     */
    static getCalendarEventsWithFallback(startDate: Date, endDate: Date): Promise<any[]>;
}
//# sourceMappingURL=OutlookRESTAPI.d.ts.map