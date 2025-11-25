/**
 * Abstraction pour l'API Outlook Office.js
 * Gère les différences entre Outlook on-premise et online
 */
export declare class OutlookAPI {
    /**
     * Vérifie si Office.js est disponible
     */
    static isAvailable(): boolean;
    /**
     * Vérifie si on est dans Outlook Desktop
     */
    static isDesktop(): boolean;
    /**
     * Vérifie si on est sur Windows
     */
    static isWindows(): boolean;
    /**
     * Vérifie si on est sur Mac
     */
    static isMac(): boolean;
    /**
     * Récupère les événements du calendrier pour une période donnée
     */
    static getCalendarItems(startDate: Date, endDate: Date): Promise<any[]>;
    /**
     * Récupère les rendez-vous via l'API appropriée
     * Adapte la méthode selon la version d'Exchange
     */
    private static getAppointmentsViaAPI;
    /**
     * Récupère les rendez-vous depuis le calendrier actif
     * Méthode alternative utilisant l'API Office.js directement
     */
    static getAppointmentsFromCalendar(_startDate: Date, _endDate: Date): Promise<any[]>;
    /**
     * Détecte la version d'Exchange Server
     * Retourne la version détectée ou null si non disponible
     */
    static getExchangeVersion(): string | null;
    /**
     * Détecte la version d'Outlook
     */
    static getOutlookVersion(): string | null;
    /**
     * Récupère les capacités API disponibles
     */
    static getAvailableCapabilities(): string[];
    /**
     * Vérifie si une capacité spécifique est disponible
     */
    static hasCapability(capability: string): boolean;
    /**
     * Récupère les informations de diagnostic complètes
     */
    static getDiagnostics(): {
        platform: string;
        host: string | null;
        version: string | null;
        exchangeVersion: string | null;
        outlookVersion: string | null;
        capabilities: string[];
        isDesktop: boolean;
        isWindows: boolean;
        isMac: boolean;
    };
}
//# sourceMappingURL=OutlookAPI.d.ts.map