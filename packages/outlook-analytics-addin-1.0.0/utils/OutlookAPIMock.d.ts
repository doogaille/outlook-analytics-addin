/**
 * Mock de l'API Outlook pour les tests et le développement
 */
export declare class OutlookAPIMock {
    /**
     * Génère des réunions mockées pour les tests
     */
    static generateMockAppointments(startDate: Date, endDate: Date): any[];
    /**
     * Mock de getUserIdentityTokenAsync
     */
    static mockGetUserIdentityToken(callback: (result: any) => void): void;
}
//# sourceMappingURL=OutlookAPIMock.d.ts.map