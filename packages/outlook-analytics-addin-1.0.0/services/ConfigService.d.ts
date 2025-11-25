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
        days?: number;
    };
    meetingsPerPage?: number;
    autoLoad?: boolean;
    theme?: 'light' | 'dark';
}
export declare class ConfigService {
    /**
     * Charge les préférences utilisateur depuis localStorage
     */
    static loadPreferences(): UserPreferences;
    /**
     * Sauvegarde les préférences utilisateur dans localStorage
     */
    static savePreferences(preferences: UserPreferences): void;
    /**
     * Met à jour une partie des préférences
     */
    static updatePreferences(updates: Partial<UserPreferences>): void;
    /**
     * Réinitialise les préférences aux valeurs par défaut
     */
    static resetPreferences(): void;
    /**
     * Récupère une préférence spécifique
     */
    static getPreference<K extends keyof UserPreferences>(key: K): UserPreferences[K] | undefined;
    /**
     * Définit une préférence spécifique
     */
    static setPreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void;
}
//# sourceMappingURL=ConfigService.d.ts.map