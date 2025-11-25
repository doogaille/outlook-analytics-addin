import { Meeting, MeetingColor, ClassifiedMeeting } from '../models/Meeting';

/**
 * Configuration des règles de classification
 */
export interface ClassificationRules {
  noFlex: {
    keywords: string[];
    patterns: RegExp[];
  };
  flex: {
    keywords: string[];
    patterns: RegExp[];
  };
  deplacement: {
    keywords: string[];
    patterns: RegExp[];
  };
}

/**
 * Configuration JSON des règles (pour chargement depuis fichier)
 */
export interface ClassificationRulesJSON {
  noFlex: {
    keywords: string[];
    patterns: string[]; // Patterns en format string "/pattern/flags"
  };
  flex: {
    keywords: string[];
    patterns: string[];
  };
  deplacement: {
    keywords: string[];
    patterns: string[];
  };
  priority?: string[]; // Ordre de priorité des catégories
  defaultColor?: string; // Couleur par défaut
}

/**
 * Service pour classifier les réunions par couleur
 * 
 * @example
 * ```typescript
 * const service = new ClassificationService();
 * const classified = service.classifyMeeting(meeting);
 * ```
 */
export class ClassificationService {
  private rules: ClassificationRules;
  private priority: string[] = ['noFlex', 'deplacement', 'flex'];
  private defaultColor: MeetingColor = MeetingColor.DEFAULT;

  constructor(rules?: ClassificationRules) {
    this.rules = rules || this.getDefaultRules();
  }

  /**
   * Charge les règles depuis un fichier JSON
   * 
   * @param jsonRules - Règles au format JSON
   * @returns Instance de ClassificationService avec les règles chargées
   */
  static fromJSON(jsonRules: ClassificationRulesJSON): ClassificationService {
    const service = new ClassificationService();
    service.loadRulesFromJSON(jsonRules);
    return service;
  }

  /**
   * Charge les règles depuis un objet JSON
   * 
   * @param jsonRules - Règles au format JSON
   */
  loadRulesFromJSON(jsonRules: ClassificationRulesJSON): void {
    // Convertir les patterns string en RegExp
    const convertPatterns = (patterns: string[]): RegExp[] => {
      return patterns.map((p) => {
        // Format: "/pattern/flags" ou "pattern"
        const match = p.match(/^\/(.*)\/([gimuy]*)$/);
        if (match) {
          return new RegExp(match[1], match[2]);
        }
        return new RegExp(p, 'i');
      });
    };

    this.rules = {
      noFlex: {
        keywords: jsonRules.noFlex.keywords || [],
        patterns: convertPatterns(jsonRules.noFlex.patterns || []),
      },
      flex: {
        keywords: jsonRules.flex.keywords || [],
        patterns: convertPatterns(jsonRules.flex.patterns || []),
      },
      deplacement: {
        keywords: jsonRules.deplacement.keywords || [],
        patterns: convertPatterns(jsonRules.deplacement.patterns || []),
      },
    };

    if (jsonRules.priority) {
      this.priority = jsonRules.priority;
    }

    if (jsonRules.defaultColor) {
      this.defaultColor = jsonRules.defaultColor as MeetingColor;
    }
  }

  /**
   * Règles de classification par défaut
   * 
   * @returns Règles par défaut hardcodées
   */
  private getDefaultRules(): ClassificationRules {
    return {
      noFlex: {
        keywords: [
          'obligatoire',
          'requis',
          'required',
          'mandatory',
          'direction',
          'validation',
          'comité',
          'board',
          'réunion importante',
        ],
        patterns: [
          /réunion\s+(de\s+)?direction/i,
          /comité\s+(de\s+)?direction/i,
          /validation\s+(obligatoire)?/i,
        ],
      },
      flex: {
        keywords: [
          'optionnel',
          'optional',
          'info',
          'information',
          'stand-up',
          'standup',
          'point',
          'brief',
        ],
        patterns: [
          /stand[- ]?up/i,
          /point\s+(d'|de\s+)?info/i,
          /réunion\s+optionnelle/i,
        ],
      },
      deplacement: {
        keywords: [
          'déplacement',
          'formation',
          'training',
          'external',
          'externe',
          'client',
          'customer',
          'on-site',
          'sur site',
          'déplacement',
        ],
        patterns: [
          /formation/i,
          /training/i,
          /déplacement/i,
          /chez\s+(le\s+)?client/i,
          /on[- ]?site/i,
        ],
      },
    };
  }

  /**
   * Classe une réunion selon les règles
   * 
   * @param meeting - Réunion à classifier
   * @returns Réunion classifiée avec couleur et raison
   * 
   * @example
   * ```typescript
   * const meeting = { subject: 'Réunion de direction', ... };
   * const classified = service.classifyMeeting(meeting);
   * // classified.color === MeetingColor.RED
   * ```
   */
  classifyMeeting(meeting: Meeting): ClassifiedMeeting {
    const subject = meeting.subject?.toLowerCase() || '';
    const body = meeting.body?.toLowerCase() || '';
    const location = meeting.location?.toLowerCase() || '';
    const text = `${subject} ${body} ${location}`;

    // Appliquer les règles selon l'ordre de priorité
    for (const category of this.priority) {
      const categoryKey = category as keyof ClassificationRules;
      if (this.matchesRules(text, this.rules[categoryKey])) {
        return this.createClassifiedMeeting(meeting, categoryKey);
      }
    }

    // Par défaut
    return {
      ...meeting,
      color: this.defaultColor,
      classificationReason: 'Non classifié',
    };
  }

  /**
   * Crée une réunion classifiée avec la couleur et la raison appropriées
   * 
   * @param meeting - Réunion originale
   * @param category - Catégorie de classification
   * @returns Réunion classifiée
   */
  private createClassifiedMeeting(
    meeting: Meeting,
    category: keyof ClassificationRules
  ): ClassifiedMeeting {
    const colorMap: Record<keyof ClassificationRules, MeetingColor> = {
      noFlex: MeetingColor.RED,
      deplacement: MeetingColor.BLUE,
      flex: MeetingColor.GREEN,
    };

    const reasonMap: Record<keyof ClassificationRules, string> = {
      noFlex: 'No Flex - Réunion obligatoire',
      deplacement: 'Déplacement/Formation',
      flex: 'Flex - Réunion optionnelle',
    };

    return {
      ...meeting,
      color: colorMap[category],
      classificationReason: reasonMap[category],
    };
  }

  /**
   * Vérifie si un texte correspond aux règles données
   */
  private matchesRules(text: string, rules: { keywords: string[]; patterns: RegExp[] }): boolean {
    // Vérifier les mots-clés
    const hasKeyword = rules.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
    if (hasKeyword) return true;

    // Vérifier les patterns regex
    const matchesPattern = rules.patterns.some((pattern) => pattern.test(text));
    if (matchesPattern) return true;

    return false;
  }

  /**
   * Classe plusieurs réunions
   */
  classifyMeetings(meetings: Meeting[]): ClassifiedMeeting[] {
    return meetings.map((meeting) => this.classifyMeeting(meeting));
  }

  /**
   * Met à jour les règles de classification
   */
  updateRules(rules: Partial<ClassificationRules>): void {
    // Fusionner les règles avec les règles par défaut
    if (rules.noFlex) {
      this.rules.noFlex = {
        ...this.rules.noFlex,
        keywords: rules.noFlex.keywords || this.rules.noFlex.keywords,
        patterns: rules.noFlex.patterns || this.rules.noFlex.patterns,
      };
    }
    if (rules.flex) {
      this.rules.flex = {
        ...this.rules.flex,
        keywords: rules.flex.keywords || this.rules.flex.keywords,
        patterns: rules.flex.patterns || this.rules.flex.patterns,
      };
    }
    if (rules.deplacement) {
      this.rules.deplacement = {
        ...this.rules.deplacement,
        keywords: rules.deplacement.keywords || this.rules.deplacement.keywords,
        patterns: rules.deplacement.patterns || this.rules.deplacement.patterns,
      };
    }
  }

  /**
   * Récupère les règles actuelles
   */
  getRules(): ClassificationRules {
    return {
      noFlex: {
        keywords: [...this.rules.noFlex.keywords],
        patterns: [...this.rules.noFlex.patterns],
      },
      flex: {
        keywords: [...this.rules.flex.keywords],
        patterns: [...this.rules.flex.patterns],
      },
      deplacement: {
        keywords: [...this.rules.deplacement.keywords],
        patterns: [...this.rules.deplacement.patterns],
      },
    };
  }
}

