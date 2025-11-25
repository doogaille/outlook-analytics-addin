/**
 * Gestionnaire d'erreurs centralisé
 */
export class ErrorHandler {
  /**
   * Formate un message d'erreur pour l'utilisateur
   */
  static formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Une erreur inattendue s\'est produite';
  }

  /**
   * Log une erreur (pour le débogage)
   */
  static logError(error: unknown, context?: string): void {
    const message = this.formatError(error);
    const logMessage = context ? `[${context}] ${message}` : message;
    console.error(logMessage, error);
  }

  /**
   * Vérifie si une erreur est liée à Office.js
   */
  static isOfficeError(error: unknown): boolean {
    const message = this.formatError(error).toLowerCase();
    return (
      message.includes('office.js') ||
      message.includes('office') ||
      message.includes('outlook') ||
      message.includes('exchange')
    );
  }

  /**
   * Génère un message d'erreur convivial pour l'utilisateur
   */
  static getUserFriendlyMessage(error: unknown): string {
    const message = this.formatError(error);

    if (this.isOfficeError(error)) {
      return 'Impossible de se connecter à Outlook. Veuillez vérifier que vous êtes connecté et réessayez.';
    }

    if (message.includes('réseau') || message.includes('network') || message.includes('fetch')) {
      return 'Erreur de connexion. Vérifiez votre connexion réseau et réessayez.';
    }

    if (message.includes('permission') || message.includes('accès')) {
      return 'Permissions insuffisantes. Veuillez contacter votre administrateur.';
    }

    return `Erreur : ${message}`;
  }
}

