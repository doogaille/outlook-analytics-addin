/**
 * Modèle représentant une réunion Outlook
 */
export interface Meeting {
    id: string;
    subject: string;
    start: Date;
    end: Date;
    duration: number;
    location?: string;
    organizer?: string;
    attendees?: string[];
    body?: string;
    isAllDay?: boolean;
    recurrence?: RecurrenceInfo;
}
/**
 * Informations de récurrence d'une réunion
 */
export interface RecurrenceInfo {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    occurrences?: number;
}
/**
 * Classification d'une réunion par couleur
 */
export declare enum MeetingColor {
    RED = "red",// No flex
    GREEN = "green",// Flex
    BLUE = "blue",// Déplacement/Formation
    DEFAULT = "gray"
}
/**
 * Réunion avec classification
 */
export interface ClassifiedMeeting extends Meeting {
    color: MeetingColor;
    classificationReason?: string;
}
//# sourceMappingURL=Meeting.d.ts.map