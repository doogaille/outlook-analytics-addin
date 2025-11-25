import { Meeting, ClassifiedMeeting } from '../models/Meeting';
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
        patterns: string[];
    };
    flex: {
        keywords: string[];
        patterns: string[];
    };
    deplacement: {
        keywords: string[];
        patterns: string[];
    };
    priority?: string[];
    defaultColor?: string;
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
export declare class ClassificationService {
    private rules;
    private priority;
    private defaultColor;
    constructor(rules?: ClassificationRules);
    /**
     * Charge les règles depuis un fichier JSON
     *
     * @param jsonRules - Règles au format JSON
     * @returns Instance de ClassificationService avec les règles chargées
     */
    static fromJSON(jsonRules: ClassificationRulesJSON): ClassificationService;
    /**
     * Charge les règles depuis un objet JSON
     *
     * @param jsonRules - Règles au format JSON
     */
    loadRulesFromJSON(jsonRules: ClassificationRulesJSON): void;
    /**
     * Règles de classification par défaut
     *
     * @returns Règles par défaut hardcodées
     */
    private getDefaultRules;
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
    classifyMeeting(meeting: Meeting): ClassifiedMeeting;
    /**
     * Crée une réunion classifiée avec la couleur et la raison appropriées
     *
     * @param meeting - Réunion originale
     * @param category - Catégorie de classification
     * @returns Réunion classifiée
     */
    private createClassifiedMeeting;
    /**
     * Vérifie si un texte correspond aux règles données
     */
    private matchesRules;
    /**
     * Classe plusieurs réunions
     */
    classifyMeetings(meetings: Meeting[]): ClassifiedMeeting[];
    /**
     * Met à jour les règles de classification
     */
    updateRules(rules: Partial<ClassificationRules>): void;
    /**
     * Récupère les règles actuelles
     */
    getRules(): ClassificationRules;
}
//# sourceMappingURL=ClassificationService.d.ts.map