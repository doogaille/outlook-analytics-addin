/**
 * Mock de l'API Outlook pour les tests et le développement
 */
export class OutlookAPIMock {
  /**
   * Génère des réunions mockées pour les tests
   */
  static generateMockAppointments(startDate: Date, endDate: Date): any[] {
    const appointments: any[] = [];
    const currentDate = new Date(startDate);
    
    // Générer des réunions sur la période
    while (currentDate <= endDate) {
      // Réunion quotidienne (stand-up)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        appointments.push({
          itemId: `mock-${currentDate.getTime()}-1`,
          subject: 'Stand-up quotidien',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 9, 0),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 9, 30),
          location: 'Teams',
          organizer: { emailAddress: { address: 'team@example.com' } },
          attendees: [
            { emailAddress: { address: 'user1@example.com' } },
            { emailAddress: { address: 'user2@example.com' } },
          ],
          bodyPreview: 'Réunion optionnelle - stand-up quotidien',
          isAllDayEvent: false,
        });
      }

      // Réunion de direction (mardi)
      if (currentDate.getDay() === 2) {
        appointments.push({
          itemId: `mock-${currentDate.getTime()}-2`,
          subject: 'Réunion de direction obligatoire',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 14, 0),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 15, 30),
          location: 'Salle de réunion A',
          organizer: { emailAddress: { address: 'directeur@example.com' } },
          attendees: [
            { emailAddress: { address: 'manager1@example.com' } },
            { emailAddress: { address: 'manager2@example.com' } },
          ],
          bodyPreview: 'Réunion obligatoire - présence requise',
          isAllDayEvent: false,
        });
      }

      // Formation (jeudi, une fois par mois)
      if (currentDate.getDay() === 4 && currentDate.getDate() <= 7) {
        appointments.push({
          itemId: `mock-${currentDate.getTime()}-3`,
          subject: 'Formation client - Déplacement',
          start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 0),
          end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 16, 0),
          location: 'Chez le client',
          organizer: { emailAddress: { address: 'formation@example.com' } },
          attendees: [
            { emailAddress: { address: 'formateur@example.com' } },
          ],
          bodyPreview: 'Formation externe - déplacement requis',
          isAllDayEvent: false,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return appointments;
  }

  /**
   * Mock de getUserIdentityTokenAsync
   */
  static mockGetUserIdentityToken(callback: (result: any) => void): void {
    setTimeout(() => {
      callback({
        status: 'succeeded',
        value: 'mock-token-12345',
      });
    }, 100);
  }
}

