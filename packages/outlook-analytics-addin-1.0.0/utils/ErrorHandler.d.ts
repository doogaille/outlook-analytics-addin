/**
 * Gestionnaire d'erreurs centralisé
 */
export declare class ErrorHandler {
    /**
     * Formate un message d'erreur pour l'utilisateur
     */
    static formatError(error: unknown): string;
    /**
     * Log une erreur (pour le débogage)
     */
    static logError(error: unknown, context?: string): void;
    /**
     * Vérifie si une erreur est liée à Office.js
     */
    static isOfficeError(error: unknown): boolean;
    /**
     * Génère un message d'erreur convivial pour l'utilisateur
     */
    static getUserFriendlyMessage(error: unknown): string;
}
//# sourceMappingURL=ErrorHandler.d.ts.map