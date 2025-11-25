/**
 * Configuration globale pour les tests
 */

// Mock Office.js
(global as any).Office = {
  context: {
    mailbox: {
      restUrl: 'https://outlook.office.com/api',
    },
  },
  HostType: {
    Outlook: 'Outlook',
  },
  PlatformType: {
    PC: 'PC',
    Mac: 'Mac',
  },
  onReady: (callback: any) => {
    callback({ host: 'Outlook' });
  },
  AsyncResultStatus: {
    Succeeded: 'succeeded',
    Failed: 'failed',
  },
};

// Mock DOM
if (typeof document === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  (global as any).window = dom.window;
  (global as any).document = dom.window.document;
  (global as any).navigator = dom.window.navigator;
}

