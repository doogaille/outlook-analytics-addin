/// <reference path="../types/office.d.ts" />

/**
 * Abstraction pour l'API Outlook Office.js
 * Gère les différences entre Outlook on-premise et online
 */
export class OutlookAPI {
  /**
   * Vérifie si Office.js est disponible
   */
  static isAvailable(): boolean {
    return typeof Office !== 'undefined' && Office.context !== undefined;
  }

  /**
   * Vérifie si on est dans Outlook Desktop
   */
  static isDesktop(): boolean {
    if (!this.isAvailable()) return false;
    return Office.context.platform === Office.PlatformType.PC || 
           Office.context.platform === Office.PlatformType.Mac;
  }

  /**
   * Vérifie si on est sur Windows
   */
  static isWindows(): boolean {
    if (!this.isAvailable()) return false;
    return Office.context.platform === Office.PlatformType.PC;
  }

  /**
   * Vérifie si on est sur Mac
   */
  static isMac(): boolean {
    if (!this.isAvailable()) return false;
    return Office.context.platform === Office.PlatformType.Mac;
  }

  /**
   * Récupère les événements du calendrier pour une période donnée
   */
  static async getCalendarItems(
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('Office.js n\'est pas disponible'));
        return;
      }

      Office.context.mailbox.getUserIdentityTokenAsync((result: any) => {
        if (result.status === 'failed') {
          reject(new Error('Impossible d\'obtenir le token d\'identité'));
          return;
        }

        // Utiliser l'API REST pour récupérer les événements
        // Note: Cette approche nécessite une configuration supplémentaire
        // Pour on-premise, on peut utiliser l'API EWS ou REST selon la version
        this.getAppointmentsViaAPI(startDate, endDate)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  /**
   * Récupère les rendez-vous via l'API appropriée
   * Adapte la méthode selon la version d'Exchange
   */
  private static async getAppointmentsViaAPI(
    _startDate: Date,
    _endDate: Date
  ): Promise<any[]> {
    // Pour on-premise, on utilise généralement l'API REST ou EWS
    // Cette méthode sera implémentée selon les capacités de l'environnement
    return new Promise((_resolve, reject) => {
      // Placeholder - à implémenter selon l'API disponible
      reject(new Error('Méthode à implémenter selon la version Exchange'));
    });
  }

  /**
   * Récupère les rendez-vous depuis le calendrier actif
   * Méthode alternative utilisant l'API Office.js directement
   */
  static async getAppointmentsFromCalendar(
    _startDate: Date,
    _endDate: Date
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('Office.js n\'est pas disponible'));
        return;
      }

      // Pour on-premise, on peut utiliser l'API REST Outlook
      // ou l'API EWS selon la version d'Exchange
      const restId = Office.context.mailbox.restUrl;
      
      if (!restId) {
        reject(new Error('REST API non disponible - vérifiez la version d\'Exchange'));
        return;
      }

      // Implémentation à compléter selon l'API disponible
      resolve([]);
    });
  }

  /**
   * Détecte la version d'Exchange Server
   * Retourne la version détectée ou null si non disponible
   */
  static getExchangeVersion(): string | null {
    if (!this.isAvailable()) return null;
    
    try {
      // Tenter de détecter via restUrl (disponible depuis Exchange 2013+)
      const restUrl = Office.context.mailbox.restUrl;
      if (restUrl) {
        // Analyser l'URL REST pour détecter la version
        // Format typique: https://outlook.office365.com/api/v1.0 ou https://mail.domain.com/EWS/Exchange.asmx
        if (restUrl.includes('/api/v2.0')) {
          return 'Exchange 2016+ ou Office 365';
        } else if (restUrl.includes('/api/v1.0')) {
          return 'Exchange 2013+ ou Office 365';
        } else if (restUrl.includes('/EWS/')) {
          return 'Exchange 2010+ (EWS)';
        }
      }

      // Tenter de détecter via l'API host (avec cast pour compatibilité)
      const mailbox = Office.context.mailbox as any;
      const host = mailbox.diagnostics?.host;
      if (host) {
        // host peut être "Outlook" pour Desktop ou "OutlookWebApp" pour web
        // Pour on-premise, on peut avoir des indices dans l'URL
      }

      // Détecter via les capacités disponibles
      const capabilities = this.getAvailableCapabilities();
      if (capabilities.includes('REST')) {
        return 'Exchange 2013+ (REST API disponible)';
      } else if (capabilities.includes('EWS')) {
        return 'Exchange 2010+ (EWS disponible)';
      }

      return 'Version inconnue';
    } catch (error) {
      console.warn('Erreur lors de la détection de la version Exchange:', error);
      return null;
    }
  }

  /**
   * Détecte la version d'Outlook
   */
  static getOutlookVersion(): string | null {
    if (!this.isAvailable()) return null;

    try {
      // Utiliser un cast pour accéder à diagnostics (peut ne pas être dans les types)
      const mailbox = Office.context.mailbox as any;
      const diagnostics = mailbox.diagnostics;
      
      if (diagnostics) {
        // host peut être "Outlook", "OutlookWebApp", etc.
        const host = diagnostics.host;
        const version = diagnostics.version;
        
        if (host && version) {
          return `${host} ${version}`;
        } else if (host) {
          return host;
        }
      }

      // Détecter via la plateforme
      if (this.isDesktop()) {
        if (this.isWindows()) {
          return 'Outlook Desktop Windows';
        } else if (this.isMac()) {
          return 'Outlook Desktop Mac';
        }
      } else {
        return 'Outlook Web App';
      }

      return null;
    } catch (error) {
      console.warn('Erreur lors de la détection de la version Outlook:', error);
      return null;
    }
  }

  /**
   * Récupère les capacités API disponibles
   */
  static getAvailableCapabilities(): string[] {
    const capabilities: string[] = [];

    if (!this.isAvailable()) return capabilities;

    try {
      // Vérifier REST API
      if (Office.context.mailbox.restUrl) {
        capabilities.push('REST');
      }

      // Vérifier EWS (Exchange Web Services)
      // Note: EWS n'est pas directement accessible via Office.js
      // mais on peut détecter sa disponibilité via restUrl
      if (Office.context.mailbox.restUrl?.includes('/EWS/')) {
        capabilities.push('EWS');
      }

      // Vérifier les API de calendrier (avec cast pour compatibilité)
      const mailbox = Office.context.mailbox as any;
      if (mailbox.item?.itemType) {
        capabilities.push('Calendar');
      }

      // Vérifier les API de boîte aux lettres
      if (mailbox.userProfile) {
        capabilities.push('UserProfile');
      }

      // Vérifier les API de recherche
      if (mailbox.searchAsync) {
        capabilities.push('Search');
      }
    } catch (error) {
      console.warn('Erreur lors de la détection des capacités:', error);
    }

    return capabilities;
  }

  /**
   * Vérifie si une capacité spécifique est disponible
   */
  static hasCapability(capability: string): boolean {
    return this.getAvailableCapabilities().includes(capability);
  }

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
  } {
    const mailbox = this.isAvailable() ? (Office.context.mailbox as any) : null;
    const diagnostics = mailbox?.diagnostics;
    
    return {
      platform: this.isAvailable() ? Office.context.platform.toString() : 'Unknown',
      host: diagnostics?.host || null,
      version: diagnostics?.version || null,
      exchangeVersion: this.getExchangeVersion(),
      outlookVersion: this.getOutlookVersion(),
      capabilities: this.getAvailableCapabilities(),
      isDesktop: this.isDesktop(),
      isWindows: this.isWindows(),
      isMac: this.isMac(),
    };
  }
}

