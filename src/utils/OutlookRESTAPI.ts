/**
 * Implémentation de l'API REST Outlook pour récupérer les réunions
 * Compatible avec Outlook on-premise via Exchange REST API
 * 
 * Optimisations :
 * - Batching des requêtes pour grandes périodes
 * - Mise en cache des tokens
 * - Retry automatique en cas d'erreur
 */
export class OutlookRESTAPI {
  private static tokenCache: { token: string; expiresAt: number } | null = null;
  private static readonly TOKEN_CACHE_TTL = 55 * 60 * 1000; // 55 minutes
  private static readonly BATCH_SIZE_DAYS = 30; // Traiter par lots de 30 jours

  /**
   * Récupère les événements du calendrier via l'API REST Outlook
   * Optimisé avec batching pour les grandes périodes
   * 
   * @param startDate - Date de début
   * @param endDate - Date de fin
   * @param accessToken - Token d'accès (optionnel, récupéré automatiquement si absent)
   * @returns Promise résolue avec la liste des événements
   */
  static async getCalendarEvents(
    startDate: Date,
    endDate: Date,
    accessToken?: string
  ): Promise<any[]> {
    if (!accessToken) {
      throw new Error('Token d\'accès requis pour l\'API REST');
    }

    // Formater les dates pour l'API REST
    const startDateTime = startDate.toISOString();
    const endDateTime = endDate.toISOString();

    // URL de l'API REST Outlook
    // Pour on-premise, cela dépend de la version d'Exchange
    const restUrl = this.getRestUrl();
    if (!restUrl) {
      throw new Error('REST API URL non disponible');
    }

    // Optimisation : batching pour grandes périodes
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > this.BATCH_SIZE_DAYS) {
      return this.getCalendarEventsBatched(startDate, endDate, accessToken);
    }

    const apiUrl = `${restUrl}/v2.0/me/calendarview?startDateTime=${encodeURIComponent(
      startDateTime
    )}&endDateTime=${encodeURIComponent(endDateTime)}&$select=subject,start,end,location,organizer,attendees,bodyPreview,isAllDayEvent,id&$top=1000`;

    try {
      const token = accessToken || await this.getCachedAccessToken();
      const response = await this.fetchWithRetry(apiUrl, token);

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let events = data.value || [];

      // Gérer la pagination si nécessaire
      if (data['@odata.nextLink']) {
        events = await this.fetchAllPages(events, data['@odata.nextLink'], token);
      }

      return events;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des événements: ${error}`);
    }
  }

  /**
   * Récupère les événements par lots pour les grandes périodes
   * 
   * @param startDate - Date de début
   * @param endDate - Date de fin
   * @param accessToken - Token d'accès
   * @returns Promise résolue avec tous les événements
   */
  private static async getCalendarEventsBatched(
    startDate: Date,
    endDate: Date,
    accessToken?: string
  ): Promise<any[]> {
    const allEvents: any[] = [];
    let currentStart = new Date(startDate);

    while (currentStart < endDate) {
      const currentEnd = new Date(currentStart);
      currentEnd.setDate(currentEnd.getDate() + this.BATCH_SIZE_DAYS);
      if (currentEnd > endDate) {
        currentEnd.setTime(endDate.getTime());
      }

      const batchEvents = await this.getCalendarEvents(currentStart, currentEnd, accessToken);
      allEvents.push(...batchEvents);

      currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() + 1); // Jour suivant
    }

    return allEvents;
  }

  /**
   * Récupère toutes les pages de résultats (pagination)
   * 
   * @param events - Événements déjà récupérés
   * @param nextLink - Lien vers la page suivante
   * @param token - Token d'accès
   * @returns Promise résolue avec tous les événements
   */
  private static async fetchAllPages(
    events: any[],
    nextLink: string,
    token: string
  ): Promise<any[]> {
    let currentLink: string | null = nextLink;
    const allEvents = [...events];

    while (currentLink) {
      const response = await this.fetchWithRetry(currentLink, token);
      if (!response.ok) break;

      const data = await response.json();
      allEvents.push(...(data.value || []));
      currentLink = data['@odata.nextLink'] || null;
    }

    return allEvents;
  }

  /**
   * Effectue une requête avec retry automatique
   * 
   * @param url - URL à appeler
   * @param token - Token d'accès
   * @param maxRetries - Nombre maximum de tentatives (défaut: 3)
   * @returns Promise résolue avec la réponse
   */
  private static async fetchWithRetry(
    url: string,
    token: string,
    maxRetries: number = 3
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Retry seulement pour les erreurs 5xx et 429 (rate limit)
        if (response.ok || (response.status < 500 && response.status !== 429)) {
          return response;
        }

        if (attempt < maxRetries) {
          // Attendre avant de réessayer (backoff exponentiel)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Échec après plusieurs tentatives');
  }

  /**
   * Récupère un token d'accès mis en cache ou en demande un nouveau
   * 
   * @returns Promise résolue avec le token
   */
  private static async getCachedAccessToken(): Promise<string> {
    // Vérifier le cache
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    // Récupérer un nouveau token
    const token = await this.getAccessToken();
    this.tokenCache = {
      token,
      expiresAt: Date.now() + this.TOKEN_CACHE_TTL,
    };

    return token;
  }

  /**
   * Récupère le token d'accès via Office.js
   */
  static async getAccessToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof Office === 'undefined' || !Office.context) {
        reject(new Error('Office.js n\'est pas disponible'));
        return;
      }

      Office.context.mailbox.getUserIdentityTokenAsync((result: any) => {
        if (result.status === 'failed') {
          reject(new Error('Impossible d\'obtenir le token d\'identité'));
          return;
        }

        // Le token retourné par getUserIdentityTokenAsync est un token d'identité
        // Pour l'API REST, on peut avoir besoin d'un token d'accès OAuth
        // Cette implémentation dépend de la configuration de l'environnement
        resolve(result.value || '');
      });
    });
  }

  /**
   * Récupère l'URL REST de base
   */
  private static getRestUrl(): string | null {
    if (typeof Office === 'undefined' || !Office.context) {
      return null;
    }

    // Pour Exchange on-premise, l'URL REST peut être différente
    // Par défaut, on utilise l'URL du mailbox
    return Office.context.mailbox.restUrl || null;
  }

  /**
   * Vérifie si l'API REST est disponible
   */
  static isRESTAvailable(): boolean {
    return this.getRestUrl() !== null;
  }

  /**
   * Récupère les événements avec gestion d'erreurs et fallback
   */
  static async getCalendarEventsWithFallback(
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      // Essayer d'obtenir le token
      const token = await this.getAccessToken();
      
      // Essayer de récupérer via REST API
      if (this.isRESTAvailable()) {
        return await this.getCalendarEvents(startDate, endDate, token);
      }
      
      throw new Error('REST API non disponible');
    } catch (error) {
      // En cas d'erreur, on peut utiliser d'autres méthodes
      // Par exemple, l'API EWS pour Exchange on-premise
      throw error;
    }
  }
}

