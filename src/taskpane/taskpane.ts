/* global Office */

// Importer le CSS (injecté automatiquement par webpack)
import './taskpane.css';

import { MeetingService } from '../services/MeetingService';
import { ClassificationService } from '../services/ClassificationService';
import { StatisticsService } from '../services/StatisticsService';
import { ConfigService } from '../services/ConfigService';
import { OutlookAPI } from '../utils/OutlookAPI';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ClassifiedMeeting } from '../models/Meeting';

/**
 * Point d'entrée principal de l'add-in
 */
Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    // Vérifier si le DOM est déjà chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      // Le DOM est déjà chargé, initialiser directement
      initialize();
    }
  }
});

let meetingService: MeetingService;
let classificationService: ClassificationService;
let statisticsService: StatisticsService;
let currentMeetings: ClassifiedMeeting[] = [];
let currentPage = 1;
let virtualScrollEnabled = false;
let virtualScrollObserver: IntersectionObserver | null = null;

/**
 * Initialise l'application
 */
function initialize(): void {
  console.log('[Analytics] 🚀 Initialisation de l\'application...');
  console.log('[Analytics] État du DOM:', document.readyState);
  
  meetingService = new MeetingService();
  classificationService = new ClassificationService();
  statisticsService = new StatisticsService();

  // Charger les préférences utilisateur
  loadUserPreferences();

  // Log des informations de diagnostic (pour debug)
  if (OutlookAPI.isAvailable()) {
    const diagnostics = OutlookAPI.getDiagnostics();
    console.log('[Analytics] Informations de diagnostic:', diagnostics);
    console.log(`[Analytics] Plateforme: ${diagnostics.platform}`);
    console.log(`[Analytics] Host: ${diagnostics.host || 'N/A'}`);
    console.log(`[Analytics] Version Outlook: ${diagnostics.outlookVersion || 'N/A'}`);
    console.log(`[Analytics] Version Exchange: ${diagnostics.exchangeVersion || 'N/A'}`);
    console.log(`[Analytics] Capacités disponibles: ${diagnostics.capabilities.join(', ') || 'Aucune'}`);
    
    // Afficher un avertissement si certaines capacités ne sont pas disponibles
    if (!diagnostics.capabilities.includes('REST') && !diagnostics.capabilities.includes('EWS')) {
      console.warn('[Analytics] ⚠️ Aucune API REST ou EWS détectée. Certaines fonctionnalités peuvent être limitées.');
    }
  }

  // Attendre un peu pour s'assurer que le DOM est complètement chargé
  setTimeout(() => {
    setupEventListeners();
    setDefaultDateRange();

    // Chargement automatique si activé
    const prefs = ConfigService.loadPreferences();
    if (prefs.autoLoad) {
      loadMeetings();
    }
    
    console.log('[Analytics] ✅ Initialisation terminée');
  }, 100);
}

/**
 * Charge les préférences utilisateur et les applique
 */
function loadUserPreferences(): void {
  const prefs = ConfigService.loadPreferences();
  
  // Appliquer les préférences de classification si disponibles
  if (prefs.classificationRules) {
    try {
      // Convertir les patterns string en RegExp
      const rules = prefs.classificationRules;
      const serviceRules: any = {};
      
      if (rules.noFlex) {
        serviceRules.noFlex = {
          keywords: rules.noFlex.keywords || [],
          patterns: (rules.noFlex.patterns || []).map((p: string) => {
            const match = p.match(/^\/(.*)\/([gimuy]*)$/);
            return match ? new RegExp(match[1], match[2]) : new RegExp(p);
          }),
        };
      }
      if (rules.flex) {
        serviceRules.flex = {
          keywords: rules.flex.keywords || [],
          patterns: (rules.flex.patterns || []).map((p: string) => {
            const match = p.match(/^\/(.*)\/([gimuy]*)$/);
            return match ? new RegExp(match[1], match[2]) : new RegExp(p);
          }),
        };
      }
      if (rules.deplacement) {
        serviceRules.deplacement = {
          keywords: rules.deplacement.keywords || [],
          patterns: (rules.deplacement.patterns || []).map((p: string) => {
            const match = p.match(/^\/(.*)\/([gimuy]*)$/);
            return match ? new RegExp(match[1], match[2]) : new RegExp(p);
          }),
        };
      }
      
      classificationService.updateRules(serviceRules);
    } catch (error) {
      console.warn('Erreur lors du chargement des règles de classification:', error);
    }
  }
}

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners(): void {
  console.log('[Analytics] Configuration des event listeners...');
  
  const loadButton = document.getElementById('loadMeetings');
  const exportCSVButton = document.getElementById('exportCSV');
  const exportJSONButton = document.getElementById('exportJSON');
  const filterRed = document.getElementById('filterRed') as HTMLInputElement;
  const filterGreen = document.getElementById('filterGreen') as HTMLInputElement;
  const filterBlue = document.getElementById('filterBlue') as HTMLInputElement;
  const sortBy = document.getElementById('sortBy') as HTMLSelectElement;
  const settingsButton = document.getElementById('settingsButton');
  const saveSettingsButton = document.getElementById('saveSettings');
  const cancelSettingsButton = document.getElementById('cancelSettings');
  const resetSettingsButton = document.getElementById('resetSettings');
  const classificationRulesButton = document.getElementById('classificationRulesButton');
  const closeRulesPanel = document.getElementById('closeRulesPanel');
  const saveRulesButton = document.getElementById('saveRules');
  const resetRulesButton = document.getElementById('resetRules');

  console.log('[Analytics] Bouton settingsButton trouvé:', !!settingsButton);

  if (loadButton) {
    loadButton.addEventListener('click', loadMeetings);
  }

  if (exportCSVButton) {
    exportCSVButton.addEventListener('click', () => exportData('csv'));
  }

  if (exportJSONButton) {
    exportJSONButton.addEventListener('click', () => exportData('json'));
  }

  if (filterRed && filterGreen && filterBlue) {
    [filterRed, filterGreen, filterBlue].forEach((filter) => {
      filter.addEventListener('change', () => displayMeetings(currentMeetings));
    });
  }

  if (sortBy) {
    sortBy.addEventListener('change', () => displayMeetings(currentMeetings));
  }

  if (settingsButton) {
    console.log('[Analytics] Attachement de l\'event listener au bouton paramètres');
    settingsButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[Analytics] ✅ Bouton paramètres cliqué !');
      toggleSettings();
    });
    // Test direct pour vérifier que le bouton existe
    console.log('[Analytics] Bouton paramètres:', settingsButton);
    console.log('[Analytics] Bouton paramètres parent:', settingsButton.parentElement);
  } else {
    console.error('[Analytics] ❌ Bouton settingsButton non trouvé dans le DOM');
    console.error('[Analytics] Éléments disponibles:', document.querySelectorAll('button').length);
    // Essayer de trouver le bouton par son texte
    const allButtons = Array.from(document.querySelectorAll('button'));
    const paramButton = allButtons.find(btn => btn.textContent?.includes('Paramètres'));
    console.log('[Analytics] Bouton avec texte "Paramètres":', paramButton);
  }

  if (saveSettingsButton) {
    saveSettingsButton.addEventListener('click', saveSettings);
  }

  if (cancelSettingsButton) {
    cancelSettingsButton.addEventListener('click', () => toggleSettings(false));
  }

  if (resetSettingsButton) {
    resetSettingsButton.addEventListener('click', resetSettings);
  }

  if (classificationRulesButton) {
    classificationRulesButton.addEventListener('click', () => toggleClassificationRules());
  }

  if (closeRulesPanel) {
    closeRulesPanel.addEventListener('click', () => toggleClassificationRules(false));
  }

  if (saveRulesButton) {
    saveRulesButton.addEventListener('click', saveClassificationRules);
  }

  if (resetRulesButton) {
    resetRulesButton.addEventListener('click', resetClassificationRules);
  }

  // Gestion des onglets de règles
  const ruleTabs = document.querySelectorAll('.rule-tab');
  ruleTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      switchRuleTab(tabName || 'noFlex');
    });
  });

  // Gestion de l'ajout de mots-clés
  const addButtons = document.querySelectorAll('.add-btn');
  addButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      if (category) {
        addKeyword(category);
      }
    });
  });

  // Permettre l'ajout avec Enter
  ['noFlexKeywordInput', 'flexKeywordInput', 'deplacementKeywordInput'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const category = id.replace('KeywordInput', '');
          addKeyword(category);
        }
      });
    }
  });
}

/**
 * Définit la plage de dates par défaut selon les préférences
 */
function setDefaultDateRange(): void {
  const prefs = ConfigService.loadPreferences();
  const days = prefs.defaultDateRange?.days || 30;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startDateInput = document.getElementById('startDate') as HTMLInputElement;
  const endDateInput = document.getElementById('endDate') as HTMLInputElement;

  if (startDateInput) {
    startDateInput.value = formatDateForInput(startDate);
  }
  if (endDateInput) {
    endDateInput.value = formatDateForInput(endDate);
  }
}

/**
 * Formate une date pour un input date
 */
function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Charge les réunions
 */
async function loadMeetings(): Promise<void> {
  const startDateInput = document.getElementById('startDate') as HTMLInputElement;
  const endDateInput = document.getElementById('endDate') as HTMLInputElement;

  if (!startDateInput || !endDateInput) {
    showError('Impossible de récupérer les dates');
    return;
  }

  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    showError('Veuillez sélectionner des dates valides');
    return;
  }

  showLoading(true);
  hideError();

  try {
    // Utiliser le mock si Office.js n'est pas disponible (développement/test)
    const useMock = !OutlookAPI.isAvailable();
    const meetings = await meetingService.getMeetings(startDate, endDate, useMock);
    const classifiedMeetings = classificationService.classifyMeetings(meetings);
    
    currentMeetings = classifiedMeetings;
    currentPage = 1; // Réinitialiser la pagination
    
    displayStatistics(classifiedMeetings);
    displayMeetings(classifiedMeetings);
    
    // Afficher un message si on utilise le mock
    if (useMock) {
      showError('Mode développement : Données mockées (Office.js non disponible)', 'info');
    }
  } catch (error) {
    ErrorHandler.logError(error, 'loadMeetings');
    const userMessage = ErrorHandler.getUserFriendlyMessage(error);
    showError(userMessage);
  } finally {
    showLoading(false);
  }
}

/**
 * Affiche les statistiques
 */
function displayStatistics(meetings: ClassifiedMeeting[]): void {
  const statsContent = document.getElementById('statsContent');
  if (!statsContent) return;

  const stats = statisticsService.calculateStatistics(meetings);
  const totalHours = Math.floor(stats.totalDuration / 60);
  const totalMinutes = stats.totalDuration % 60;

  // Calculer les pourcentages pour les barres de progression
  const total = stats.total || 1;
  const redPercent = (stats.byColor.red / total) * 100;
  const greenPercent = (stats.byColor.green / total) * 100;
  const bluePercent = (stats.byColor.blue / total) * 100;

    statsContent.innerHTML = `
    <div class="stats-grid">
      <div class="stats-card">
        <h3>Total réunions</h3>
        <div class="value">${stats.total}</div>
      </div>
      <div class="stats-card">
        <h3>Temps total</h3>
        <div class="value">${totalHours}h ${totalMinutes}min</div>
      </div>
      <div class="stats-card">
        <h3>Durée moyenne</h3>
        <div class="value">${Math.round(stats.averageDuration)} min</div>
      </div>
      <div class="stats-card">
        <h3>Par semaine</h3>
        <div class="value">${Math.round(stats.weeklyFrequency * 10) / 10}</div>
      </div>
    </div>
    <div class="stat-item">
      <div class="stat-header">
        <strong>🔴 No Flex:</strong>
        <span>${stats.byColor.red} réunions • ${Math.round(stats.byColorDuration.red / 60)}h</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill red" style="width: ${redPercent}%"></div>
      </div>
    </div>
    <div class="stat-item">
      <div class="stat-header">
        <strong>🟢 Flex:</strong>
        <span>${stats.byColor.green} réunions • ${Math.round(stats.byColorDuration.green / 60)}h</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill green" style="width: ${greenPercent}%"></div>
      </div>
    </div>
    <div class="stat-item">
      <div class="stat-header">
        <strong>🔵 Déplacement/Formation:</strong>
        <span>${stats.byColor.blue} réunions • ${Math.round(stats.byColorDuration.blue / 60)}h</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill blue" style="width: ${bluePercent}%"></div>
      </div>
    </div>
  `;

  // Afficher les graphiques
  displayCharts(meetings, stats);
}

/**
 * Affiche les graphiques visuels
 */
function displayCharts(meetings: ClassifiedMeeting[], stats: any): void {
  displayPieChart(stats);
  displayBarChart(meetings);
}

/**
 * Affiche le graphique circulaire (pie chart)
 */
function displayPieChart(stats: any): void {
  const pieChart = document.getElementById('pieChart');
  if (!pieChart) return;

  const total = stats.total || 1;
  const redPercent = (stats.byColor.red / total) * 100;
  const greenPercent = (stats.byColor.green / total) * 100;
  const bluePercent = (stats.byColor.blue / total) * 100;

  // Calculer les angles pour le graphique circulaire
  const redAngle = (redPercent / 100) * 360;
  const greenAngle = (greenPercent / 100) * 360;
  const blueAngle = (bluePercent / 100) * 360;

  let currentAngle = 0;
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  // Créer le SVG
  let svg = `<svg viewBox="0 0 200 200" class="pie-svg">`;
  
  // Segment rouge
  if (redPercent > 0) {
    const startAngle = currentAngle;
    const endAngle = currentAngle + redAngle;
    const path = createPieSegment(centerX, centerY, radius, startAngle, endAngle);
    svg += `<path d="${path}" fill="#d13438" class="pie-segment" data-color="red" />`;
    currentAngle = endAngle;
  }

  // Segment vert
  if (greenPercent > 0) {
    const startAngle = currentAngle;
    const endAngle = currentAngle + greenAngle;
    const path = createPieSegment(centerX, centerY, radius, startAngle, endAngle);
    svg += `<path d="${path}" fill="#107c10" class="pie-segment" data-color="green" />`;
    currentAngle = endAngle;
  }

  // Segment bleu
  if (bluePercent > 0) {
    const startAngle = currentAngle;
    const endAngle = currentAngle + blueAngle;
    const path = createPieSegment(centerX, centerY, radius, startAngle, endAngle);
    svg += `<path d="${path}" fill="#0078d4" class="pie-segment" data-color="blue" />`;
  }

  svg += `</svg>`;

  // Légende
  const legend = `
    <div class="pie-legend">
      <div class="legend-item">
        <span class="legend-color red"></span>
        <span>No Flex: ${stats.byColor.red} (${Math.round(redPercent)}%)</span>
      </div>
      <div class="legend-item">
        <span class="legend-color green"></span>
        <span>Flex: ${stats.byColor.green} (${Math.round(greenPercent)}%)</span>
      </div>
      <div class="legend-item">
        <span class="legend-color blue"></span>
        <span>Déplacement: ${stats.byColor.blue} (${Math.round(bluePercent)}%)</span>
      </div>
    </div>
  `;

  pieChart.innerHTML = svg + legend;
}

/**
 * Crée un segment de graphique circulaire
 */
function createPieSegment(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'Z'
  ].join(' ');
}

/**
 * Convertit des coordonnées polaires en coordonnées cartésiennes
 */
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): { x: number; y: number } {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

/**
 * Affiche le graphique en barres pour la répartition temporelle
 */
function displayBarChart(meetings: ClassifiedMeeting[]): void {
  const barChart = document.getElementById('barChart');
  if (!barChart) return;

  // Grouper les réunions par semaine
  const weeklyData: { [key: string]: { red: number; green: number; blue: number } } = {};
  
  meetings.forEach((meeting) => {
    const weekKey = getWeekKey(meeting.start);
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { red: 0, green: 0, blue: 0 };
    }
    if (meeting.color === 'red') weeklyData[weekKey].red++;
    else if (meeting.color === 'green') weeklyData[weekKey].green++;
    else if (meeting.color === 'blue') weeklyData[weekKey].blue++;
  });

  // Trier les semaines
  const weeks = Object.keys(weeklyData).sort();
  const maxCount = Math.max(...weeks.map(w => weeklyData[w].red + weeklyData[w].green + weeklyData[w].blue), 1);

  // Créer le graphique
  let html = '<div class="bar-chart-content">';
  
  weeks.forEach((week) => {
    const data = weeklyData[week];
    const total = data.red + data.green + data.blue;
    const redPercent = (data.red / maxCount) * 100;
    const greenPercent = (data.green / maxCount) * 100;
    const bluePercent = (data.blue / maxCount) * 100;

    html += `
      <div class="bar-row">
        <div class="bar-label">${formatWeekLabel(week)}</div>
        <div class="bar-container">
          <div class="bar-segment red" style="width: ${redPercent}%" title="No Flex: ${data.red}"></div>
          <div class="bar-segment green" style="width: ${greenPercent}%" title="Flex: ${data.green}"></div>
          <div class="bar-segment blue" style="width: ${bluePercent}%" title="Déplacement: ${data.blue}"></div>
        </div>
        <div class="bar-value">${total}</div>
      </div>
    `;
  });

  html += '</div>';
  barChart.innerHTML = html;
}

/**
 * Obtient la clé de semaine pour une date
 */
function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay();
  const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lundi
  const monday = new Date(d.setDate(diff));
  return `${monday.getFullYear()}-W${getWeekNumber(monday)}`;
}

/**
 * Obtient le numéro de semaine
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Formate le label de semaine
 */
function formatWeekLabel(weekKey: string): string {
  const [year, week] = weekKey.split('-W');
  return `S${week} ${year}`;
}

/**
 * Trie les réunions selon le critère sélectionné
 */
function sortMeetings(meetings: ClassifiedMeeting[], sortBy: string): ClassifiedMeeting[] {
  const sorted = [...meetings];

  switch (sortBy) {
    case 'date-asc':
      sorted.sort((a, b) => a.start.getTime() - b.start.getTime());
      break;
    case 'date-desc':
      sorted.sort((a, b) => b.start.getTime() - a.start.getTime());
      break;
    case 'duration-asc':
      sorted.sort((a, b) => a.duration - b.duration);
      break;
    case 'duration-desc':
      sorted.sort((a, b) => b.duration - a.duration);
      break;
    case 'subject-asc':
      sorted.sort((a, b) => a.subject.localeCompare(b.subject, 'fr'));
      break;
    case 'subject-desc':
      sorted.sort((a, b) => b.subject.localeCompare(a.subject, 'fr'));
      break;
  }

  return sorted;
}

/**
 * Affiche la liste des réunions avec pagination
 */
function displayMeetings(meetings: ClassifiedMeeting[]): void {
  const meetingsContent = document.getElementById('meetingsContent');
  const meetingsCount = document.getElementById('meetingsCount');
  const pagination = document.getElementById('pagination');
  if (!meetingsContent) return;

  const filterRed = (document.getElementById('filterRed') as HTMLInputElement)?.checked ?? true;
  const filterGreen = (document.getElementById('filterGreen') as HTMLInputElement)?.checked ?? true;
  const filterBlue = (document.getElementById('filterBlue') as HTMLInputElement)?.checked ?? true;
  const sortByValue = (document.getElementById('sortBy') as HTMLSelectElement)?.value || 'date-desc';

  // Filtrer
  let filteredMeetings = meetings.filter((meeting) => {
    if (meeting.color === 'red') return filterRed;
    if (meeting.color === 'green') return filterGreen;
    if (meeting.color === 'blue') return filterBlue;
    return true;
  });

  // Afficher le nombre total
  if (meetingsCount) {
    meetingsCount.textContent = `${filteredMeetings.length} réunion${filteredMeetings.length > 1 ? 's' : ''}`;
  }

  // Trier
  filteredMeetings = sortMeetings(filteredMeetings, sortByValue);

  if (filteredMeetings.length === 0) {
    meetingsContent.innerHTML = `
      <div class="no-meetings">
        <p>Aucune réunion trouvée pour cette période.</p>
        <p style="margin-top: 8px; font-size: 14px; opacity: 0.7;">
          Essayez de modifier les filtres ou la période de dates.
        </p>
      </div>
    `;
    if (pagination) pagination.innerHTML = '';
    return;
  }

  // Pagination - utiliser la préférence utilisateur
  const prefs = ConfigService.loadPreferences();
  const meetingsPerPage = prefs.meetingsPerPage || 20;
  const totalPages = Math.ceil(filteredMeetings.length / meetingsPerPage);
  const startIndex = (currentPage - 1) * meetingsPerPage;
  const endIndex = startIndex + meetingsPerPage;
  const paginatedMeetings = filteredMeetings.slice(startIndex, endIndex);

  // Activer la virtualisation pour les grandes listes (> 50 éléments)
  const shouldUseVirtualization = paginatedMeetings.length > 50;
  
  if (shouldUseVirtualization && !virtualScrollEnabled) {
    virtualScrollEnabled = true;
    enableVirtualScroll(meetingsContent);
  } else if (!shouldUseVirtualization && virtualScrollEnabled) {
    virtualScrollEnabled = false;
    disableVirtualScroll(meetingsContent);
  }

  // Afficher les réunions (avec virtualisation si activée)
  if (virtualScrollEnabled) {
    displayMeetingsVirtualized(meetingsContent, paginatedMeetings);
  } else {
    displayMeetingsStandard(meetingsContent, paginatedMeetings);
  }

  // Afficher la pagination (toujours affichée, même avec virtualisation)
  if (pagination && totalPages > 1) {
    let paginationHTML = '<div class="pagination-controls">';
    
    // Bouton précédent
    if (currentPage > 1) {
      paginationHTML += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">‹ Précédent</button>`;
    }
    
    // Numéros de page
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        paginationHTML += '<span class="page-ellipsis">...</span>';
      }
    }
    
    // Bouton suivant
    if (currentPage < totalPages) {
      paginationHTML += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">Suivant ›</button>`;
    }
    
    paginationHTML += '</div>';
    pagination.innerHTML = paginationHTML;
  } else if (pagination) {
    pagination.innerHTML = '';
  }
}

/**
 * Affiche les réunions avec virtualisation
 */
function displayMeetingsVirtualized(
  container: HTMLElement,
  meetings: ClassifiedMeeting[]
): void {
  const ITEM_HEIGHT = 120; // Hauteur estimée d'un élément
  const VIEWPORT_HEIGHT = container.clientHeight || 600;
  const BUFFER_SIZE = 5; // Nombre d'éléments à afficher en plus (au-dessus et en-dessous)
  
  // Calculer le nombre d'éléments visibles
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT) + BUFFER_SIZE * 2;
  const startIndex = 0;
  const endIndex = Math.min(startIndex + visibleCount, meetings.length);
  
  // Créer le conteneur virtuel
  const totalHeight = meetings.length * ITEM_HEIGHT;
  const offsetY = startIndex * ITEM_HEIGHT;
  
  // Mettre à jour l'info de virtualisation
  const infoEl = document.getElementById('virtualScrollInfo');
  const visibleCountEl = document.getElementById('visibleCount');
  const totalCountEl = document.getElementById('totalCount');
  
  if (infoEl) infoEl.style.display = 'block';
  if (visibleCountEl) visibleCountEl.textContent = endIndex.toString();
  if (totalCountEl) totalCountEl.textContent = meetings.length.toString();
  
  // Afficher seulement les éléments visibles
  const visibleMeetings = meetings.slice(startIndex, endIndex);
  
  // Créer la structure HTML avec virtualisation
  const virtualContainer = document.createElement('div');
  virtualContainer.className = 'virtual-scroll-container';
  virtualContainer.style.cssText = `height: ${totalHeight}px; position: relative;`;
  
  const virtualContent = document.createElement('div');
  virtualContent.className = 'virtual-scroll-content';
  virtualContent.style.cssText = `transform: translateY(${offsetY}px);`;
  
  visibleMeetings.forEach((meeting, index) => {
    const item = document.createElement('div');
    item.innerHTML = renderMeetingItem(meeting, startIndex + index);
    const meetingItem = item.firstElementChild as HTMLElement;
    if (meetingItem) {
      virtualContent.appendChild(meetingItem);
    }
  });
  
  virtualContainer.appendChild(virtualContent);
  container.innerHTML = '';
  container.appendChild(virtualContainer);
  
  // Configurer le scroll pour charger plus d'éléments dynamiquement
  setupVirtualScrollWithDynamicLoad(container, virtualContent, meetings, ITEM_HEIGHT, visibleCount, startIndex, endIndex);
}

/**
 * Affiche les réunions de manière standard (sans virtualisation)
 */
function displayMeetingsStandard(
  container: HTMLElement,
  meetings: ClassifiedMeeting[]
): void {
  const infoEl = document.getElementById('virtualScrollInfo');
  if (infoEl) infoEl.style.display = 'none';
  
  container.innerHTML = meetings
    .map((meeting, index) => renderMeetingItem(meeting, index))
    .join('');

  // La pagination est gérée dans displayMeetings
}

/**
 * Rend un élément de réunion
 */
function renderMeetingItem(meeting: ClassifiedMeeting, index: number): string {
  const dateStr = meeting.start.toLocaleDateString('fr-FR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = `${meeting.start.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })} - ${meeting.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

  const durationIcon = meeting.duration >= 60 ? '⏱️' : '⏰';
  const locationIcon = meeting.location ? '📍' : '';
  
  return `
    <div class="meeting-item ${meeting.color}" data-index="${index}">
      <div class="meeting-subject">${escapeHtml(meeting.subject)}</div>
      <div class="meeting-details">
        <span>${dateStr}</span>
        <span>${timeStr}</span>
        <span>${durationIcon} ${meeting.duration} min</span>
        ${meeting.location ? `<span>${locationIcon} ${escapeHtml(meeting.location)}</span>` : ''}
      </div>
      <div class="meeting-classification">
        <span>🏷️</span>
        ${escapeHtml(meeting.classificationReason || '')}
      </div>
    </div>
  `;
}

/**
 * Configure le scroll virtuel avec chargement dynamique
 */
function setupVirtualScrollWithDynamicLoad(
  container: HTMLElement,
  content: HTMLElement,
  meetings: ClassifiedMeeting[],
  itemHeight: number,
  visibleCount: number,
  currentStart: number,
  currentEnd: number
): void {
  let startIndex = currentStart;
  let endIndex = currentEnd;
  let isScrolling = false;

  const updateVisibleItems = () => {
    if (isScrolling) return;
    isScrolling = true;

    requestAnimationFrame(() => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;
      
      // Calculer les indices visibles
      const newStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - visibleCount);
      const newEndIndex = Math.min(meetings.length, Math.ceil((scrollTop + viewportHeight) / itemHeight) + visibleCount);

      // Mettre à jour seulement si nécessaire
      if (newStartIndex !== startIndex || newEndIndex !== endIndex) {
        startIndex = newStartIndex;
        endIndex = newEndIndex;

        // Mettre à jour le contenu
        const visibleMeetings = meetings.slice(startIndex, endIndex);
        const offsetY = startIndex * itemHeight;

        content.style.transform = `translateY(${offsetY}px)`;
        content.innerHTML = visibleMeetings
          .map((meeting, index) => renderMeetingItem(meeting, startIndex + index))
          .join('');

        // Mettre à jour l'info
        const visibleCountEl = document.getElementById('visibleCount');
        const totalCountEl = document.getElementById('totalCount');
        if (visibleCountEl) visibleCountEl.textContent = endIndex.toString();
        if (totalCountEl) totalCountEl.textContent = meetings.length.toString();
      }

      isScrolling = false;
    });
  };

  // Écouter le scroll
  container.addEventListener('scroll', updateVisibleItems, { passive: true });
  
  // Observer les éléments pour optimiser
  if (virtualScrollObserver) {
    virtualScrollObserver.disconnect();
  }

  const options = {
    root: container,
    rootMargin: '200px',
    threshold: 0,
  };

  virtualScrollObserver = new IntersectionObserver(() => {
    // Déclencher une mise à jour si nécessaire
    updateVisibleItems();
  }, options);

  // Observer le conteneur
  virtualScrollObserver.observe(content);
}

/**
 * Active le scroll virtuel
 */
function enableVirtualScroll(container: HTMLElement): void {
  container.classList.add('virtual-scroll-enabled');
  container.style.overflowY = 'auto';
  container.style.maxHeight = '600px';
}

/**
 * Désactive le scroll virtuel
 */
function disableVirtualScroll(container: HTMLElement): void {
  container.classList.remove('virtual-scroll-enabled');
  container.style.overflowY = '';
  container.style.maxHeight = '';
  
  if (virtualScrollObserver) {
    virtualScrollObserver.disconnect();
    virtualScrollObserver = null;
  }
}

/**
 * Change de page (exposé globalement pour les boutons onclick)
 */
(global as any).goToPage = function(page: number): void {
  currentPage = page;
  displayMeetings(currentMeetings);
};

/**
 * Exporte les données
 */
function exportData(format: 'csv' | 'json'): void {
  if (currentMeetings.length === 0) {
    showError('Aucune donnée à exporter');
    return;
  }

  if (format === 'csv') {
    exportToCSV(currentMeetings);
    showError('Export CSV réussi', 'success');
  } else {
    exportToJSON(currentMeetings);
    showError('Export JSON réussi', 'success');
  }
}

/**
 * Exporte en CSV
 */
function exportToCSV(meetings: ClassifiedMeeting[]): void {
  const headers = ['Sujet', 'Date début', 'Date fin', 'Durée (min)', 'Couleur', 'Classification', 'Lieu'];
  const rows = meetings.map((m) => [
    m.subject,
    m.start.toISOString(),
    m.end.toISOString(),
    m.duration.toString(),
    m.color,
    m.classificationReason || '',
    m.location || '',
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  downloadFile(csv, 'meetings-analytics.csv', 'text/csv');
}

/**
 * Exporte en JSON
 */
function exportToJSON(meetings: ClassifiedMeeting[]): void {
  const json = JSON.stringify(meetings, null, 2);
  downloadFile(json, 'meetings-analytics.json', 'application/json');
}

/**
 * Télécharge un fichier
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Échappe le HTML pour éviter les injections
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Affiche/masque le chargement avec animation
 */
function showLoading(show: boolean): void {
  const loading = document.getElementById('loading');
  if (loading) {
    if (show) {
      loading.style.display = 'block';
      // Forcer le reflow pour l'animation
      loading.offsetHeight;
      loading.style.opacity = '1';
    } else {
      loading.style.opacity = '0';
      setTimeout(() => {
        loading.style.display = 'none';
      }, 300);
    }
  }
}

/**
 * Affiche une notification toast
 */
function showError(message: string, type: 'error' | 'warning' | 'info' | 'success' = 'error'): void {
  showToast(message, type);
}

/**
 * Affiche une notification toast moderne
 */
function showToast(message: string, type: 'error' | 'warning' | 'info' | 'success' = 'info', duration: number = 4000): void {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Icônes selon le type
  const icons: { [key: string]: string } = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Fermer">×</button>
    </div>
  `;

  // Animation d'entrée
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Gestion de la fermeture
  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      hideToast(toast);
    });
  }

  // Fermeture automatique
  if (duration > 0) {
    setTimeout(() => {
      hideToast(toast);
    }, duration);
  }
}

/**
 * Masque une notification toast
 */
function hideToast(toast: HTMLElement): void {
  toast.classList.remove('show');
  toast.classList.add('hide');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

/**
 * Masque l'erreur (compatibilité avec l'ancien code)
 */
function hideError(): void {
  // Cette fonction est conservée pour la compatibilité
  // Les toasts se ferment automatiquement ou manuellement
}

/**
 * Affiche/masque le panneau de paramètres
 */
function toggleSettings(show?: boolean): void {
  const panel = document.getElementById('settingsPanel');
  if (!panel) {
    console.error('Panneau settingsPanel non trouvé');
    return;
  }

  const isVisible = panel.style.display !== 'none';
  const shouldShow = show !== undefined ? show : !isVisible;

  console.log('toggleSettings:', { isVisible, shouldShow, show });

  if (shouldShow) {
    panel.style.display = 'block';
    panel.style.visibility = 'visible';
    loadSettingsIntoForm();
    // Scroll vers le panneau
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    panel.style.display = 'none';
    panel.style.visibility = 'hidden';
  }
}

/**
 * Charge les paramètres dans le formulaire
 */
function loadSettingsIntoForm(): void {
  const prefs = ConfigService.loadPreferences();

  const defaultDays = document.getElementById('defaultDays') as HTMLInputElement;
  const meetingsPerPage = document.getElementById('meetingsPerPage') as HTMLInputElement;
  const autoLoad = document.getElementById('autoLoad') as HTMLInputElement;

  if (defaultDays) {
    defaultDays.value = (prefs.defaultDateRange?.days || 30).toString();
  }
  if (meetingsPerPage) {
    meetingsPerPage.value = (prefs.meetingsPerPage || 20).toString();
  }
  if (autoLoad) {
    autoLoad.checked = prefs.autoLoad || false;
  }
}

/**
 * Sauvegarde les paramètres
 */
function saveSettings(): void {
  const defaultDays = document.getElementById('defaultDays') as HTMLInputElement;
  const meetingsPerPage = document.getElementById('meetingsPerPage') as HTMLInputElement;
  const autoLoad = document.getElementById('autoLoad') as HTMLInputElement;

  try {
    ConfigService.updatePreferences({
      defaultDateRange: {
        days: parseInt(defaultDays?.value || '30', 10),
      },
      meetingsPerPage: parseInt(meetingsPerPage?.value || '20', 10),
      autoLoad: autoLoad?.checked || false,
    });

    // Réinitialiser la pagination et recharger
    currentPage = 1;
    setDefaultDateRange();
    
    if (currentMeetings.length > 0) {
      displayMeetings(currentMeetings);
    }

    toggleSettings(false);
    showError('Paramètres enregistrés avec succès', 'success');
    setTimeout(hideError, 3000);
  } catch (error) {
    showError('Erreur lors de la sauvegarde des paramètres');
  }
}

/**
 * Réinitialise les paramètres
 */
function resetSettings(): void {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
    ConfigService.resetPreferences();
    loadSettingsIntoForm();
    setDefaultDateRange();
    showError('Paramètres réinitialisés', 'info');
    setTimeout(hideError, 3000);
  }
}

/**
 * Affiche/masque le panneau de règles de classification
 */
function toggleClassificationRules(show?: boolean): void {
  const panel = document.getElementById('classificationRulesPanel');
  if (!panel) return;

  const isVisible = panel.style.display !== 'none';
  const shouldShow = show !== undefined ? show : !isVisible;

  if (shouldShow) {
    panel.style.display = 'block';
    loadClassificationRulesIntoForm();
  } else {
    panel.style.display = 'none';
  }
}

/**
 * Change d'onglet dans le panneau de règles
 */
function switchRuleTab(tabName: string): void {
  // Mettre à jour les onglets
  document.querySelectorAll('.rule-tab').forEach((tab) => {
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Afficher la section correspondante
  document.querySelectorAll('.rule-section').forEach((section) => {
    if (section.id === `${tabName}Rules`) {
      (section as HTMLElement).style.display = 'block';
    } else {
      (section as HTMLElement).style.display = 'none';
    }
  });
}

/**
 * Charge les règles de classification dans le formulaire
 */
function loadClassificationRulesIntoForm(): void {
  const rules = classificationService.getRules();

  // Charger les mots-clés pour chaque catégorie
  ['noFlex', 'flex', 'deplacement'].forEach((category) => {
    const keywordsList = document.getElementById(`${category}Keywords`);
    if (keywordsList) {
      keywordsList.innerHTML = '';
      const keywords = rules[category as keyof typeof rules].keywords || [];
      keywords.forEach((keyword) => {
        addKeywordTag(category, keyword);
      });
    }
  });
}

/**
 * Ajoute un tag de mot-clé dans la liste
 */
function addKeywordTag(category: string, keyword: string): void {
  const keywordsList = document.getElementById(`${category}Keywords`);
  if (!keywordsList) return;

  const tag = document.createElement('div');
  tag.className = 'keyword-tag';
  tag.innerHTML = `
    <span>${escapeHtml(keyword)}</span>
    <button class="remove-keyword" data-category="${category}" data-keyword="${escapeHtml(keyword)}">×</button>
  `;

  // Gestion de la suppression
  const removeBtn = tag.querySelector('.remove-keyword');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      removeKeyword(category, keyword);
      tag.remove();
    });
  }

  keywordsList.appendChild(tag);
}

/**
 * Ajoute un nouveau mot-clé
 */
function addKeyword(category: string): void {
  const input = document.getElementById(`${category}KeywordInput`) as HTMLInputElement;
  if (!input) return;

  const keyword = input.value.trim().toLowerCase();
  if (!keyword) {
    showError('Veuillez entrer un mot-clé', 'warning');
    return;
  }

  // Vérifier si le mot-clé existe déjà
  const existingKeywords = Array.from(
    document.querySelectorAll(`#${category}Keywords .keyword-tag span`)
  ).map((el) => el.textContent?.toLowerCase());

  if (existingKeywords.includes(keyword)) {
    showError('Ce mot-clé existe déjà', 'warning');
    return;
  }

  addKeywordTag(category, keyword);
  input.value = '';
  input.focus();
}

/**
 * Supprime un mot-clé
 */
function removeKeyword(_category: string, _keyword: string): void {
  // La suppression visuelle est gérée directement dans addKeywordTag
  // Cette fonction peut être étendue pour d'autres actions (logs, analytics, etc.)
}

/**
 * Sauvegarde les règles de classification
 */
function saveClassificationRules(): void {
  // Récupérer les règles actuelles pour préserver les patterns
  const currentRules = classificationService.getRules();
  
  // Convertir les RegExp en string pour la sauvegarde
  const rules: any = {
    noFlex: {
      keywords: [],
      patterns: currentRules.noFlex.patterns.map((p) => p.toString()),
    },
    flex: {
      keywords: [],
      patterns: currentRules.flex.patterns.map((p) => p.toString()),
    },
    deplacement: {
      keywords: [],
      patterns: currentRules.deplacement.patterns.map((p) => p.toString()),
    },
  };

  // Récupérer les mots-clés de chaque catégorie
  ['noFlex', 'flex', 'deplacement'].forEach((category) => {
    const keywordsList = document.getElementById(`${category}Keywords`);
    if (keywordsList) {
      const keywords = Array.from(keywordsList.querySelectorAll('.keyword-tag span')).map(
        (el) => el.textContent || ''
      );
      rules[category].keywords = keywords;
    }
  });

  // Sauvegarder dans les préférences
  ConfigService.updatePreferences({
    classificationRules: rules,
  });

  // Convertir les patterns string en RegExp pour le service
  const serviceRules = {
    noFlex: {
      keywords: rules.noFlex.keywords,
      patterns: rules.noFlex.patterns.map((p: string) => {
        // Convertir "/pattern/flags" en RegExp
        const match = p.match(/^\/(.*)\/([gimuy]*)$/);
        return match ? new RegExp(match[1], match[2]) : new RegExp(p);
      }),
    },
    flex: {
      keywords: rules.flex.keywords,
      patterns: rules.flex.patterns.map((p: string) => {
        const match = p.match(/^\/(.*)\/([gimuy]*)$/);
        return match ? new RegExp(match[1], match[2]) : new RegExp(p);
      }),
    },
    deplacement: {
      keywords: rules.deplacement.keywords,
      patterns: rules.deplacement.patterns.map((p: string) => {
        const match = p.match(/^\/(.*)\/([gimuy]*)$/);
        return match ? new RegExp(match[1], match[2]) : new RegExp(p);
      }),
    },
  };

  // Mettre à jour le service
  classificationService.updateRules(serviceRules);

  // Reclassifier les réunions actuelles si elles existent
  if (currentMeetings.length > 0) {
    const meetings = currentMeetings.map((m) => {
      const { color, classificationReason, ...meeting } = m;
      return meeting;
    });
    currentMeetings = classificationService.classifyMeetings(meetings);
    displayMeetings(currentMeetings);
    displayStatistics(currentMeetings);
  }

  showError('Règles de classification enregistrées avec succès', 'success');
  setTimeout(() => {
    toggleClassificationRules(false);
    hideError();
  }, 2000);
}

/**
 * Réinitialise les règles de classification
 */
function resetClassificationRules(): void {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser les règles de classification aux valeurs par défaut ?')) {
    // Réinitialiser le service (créer une nouvelle instance avec les règles par défaut)
    const defaultRules = new ClassificationService().getRules();
    classificationService.updateRules(defaultRules);
    
    // Convertir les RegExp en string pour la sauvegarde
    const defaultRulesForStorage = {
      noFlex: {
        keywords: defaultRules.noFlex.keywords,
        patterns: defaultRules.noFlex.patterns.map((p) => p.toString()),
      },
      flex: {
        keywords: defaultRules.flex.keywords,
        patterns: defaultRules.flex.patterns.map((p) => p.toString()),
      },
      deplacement: {
        keywords: defaultRules.deplacement.keywords,
        patterns: defaultRules.deplacement.patterns.map((p) => p.toString()),
      },
    };
    
    // Réinitialiser les préférences
    ConfigService.updatePreferences({
      classificationRules: defaultRulesForStorage,
    });
    
    loadClassificationRulesIntoForm();
    showError('Règles réinitialisées aux valeurs par défaut', 'info');
    setTimeout(hideError, 3000);
  }
}

