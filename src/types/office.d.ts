/**
 * Déclarations TypeScript pour Office.js
 * Compatible avec Outlook on-premise
 */

declare namespace Office {
  interface Context {
    mailbox: Mailbox;
    platform: PlatformType;
  }

  interface Mailbox {
    restUrl?: string;
    getUserIdentityTokenAsync(
      callback: (result: AsyncResult<string>) => void
    ): void;
  }

  enum HostType {
    Outlook = 'Outlook',
  }

  enum PlatformType {
    PC = 'PC',
    Mac = 'Mac',
    OfficeOnline = 'OfficeOnline',
  }

  enum AsyncResultStatus {
    Succeeded = 'succeeded',
    Failed = 'failed',
  }

  interface AsyncResult<T> {
    value?: T;
    status: AsyncResultStatus;
    error?: OfficeExtension.Error;
  }

  interface AppointmentRead {
    itemId?: string;
    subject?: string;
    start: string | Date;
    end: string | Date;
    location?: string;
    organizer?: {
      emailAddress?: {
        address?: string;
      };
    };
    attendees?: Array<{
      emailAddress?: {
        address?: string;
      };
      displayName?: string;
    }>;
    bodyPreview?: string;
    body?: string;
    isAllDayEvent?: boolean;
  }

  function onReady(callback: (info: { host: HostType }) => void): void;
}

declare namespace OfficeExtension {
  interface Error {
    name: string;
    message: string;
    code?: string;
  }
}

// Déclaration globale pour Office
// Utilisation d'une interface pour éviter les conflits avec le namespace
interface OfficeGlobal {
  context: Office.Context;
  onReady: (callback: (info: { host: Office.HostType }) => void) => void;
  HostType: typeof Office.HostType;
  PlatformType: typeof Office.PlatformType;
  AsyncResultStatus: typeof Office.AsyncResultStatus;
}

declare global {
  var Office: OfficeGlobal;
}

export {};

