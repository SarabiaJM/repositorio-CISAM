const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTF3wBIZH3SrknpKPNrTUpornzkLmFa7Pm0g40-V4gPZSv4ILdpGfnpZtsY2K0OZNxbljAvlaGoxZNr/pub?gid=953634781&single=true&output=csv';

const STORAGE_KEY = 'cisam-language';
const VALID_LANGUAGES = Object.freeze(['es', 'va']);
const LANGUAGE_CONFIG = Object.freeze({
  es: Object.freeze({ documentLanguage: 'es', locale: 'es' }),
  va: Object.freeze({ documentLanguage: 'ca-valencia', locale: 'ca' })
});
const SORT_VALUES = Object.freeze([
  'name-asc',
  'name-desc',
  'university-asc',
  'university-desc'
]);
const URL_PARAM_ORDER = Object.freeze([
  'lang',
  'q',
  'university',
  'scope',
  'type',
  'timing',
  'funding',
  'audience',
  'space',
  'sort',
  'id'
]);
const URL_PARAM_SET = new Set(URL_PARAM_ORDER);
const HISTORY_STATE_KEY = 'cisamDialogEntry';
const QUERY_MAX_LENGTH = 300;
const SEARCH_URL_DELAY = 180;
const RESULTS_BATCH_SIZE = 12;

function deepFreeze(value) {
  Object.values(value).forEach((item) => {
    if (item && typeof item === 'object' && !Object.isFrozen(item)) deepFreeze(item);
  });
  return Object.freeze(value);
}

const TRANSLATIONS = deepFreeze({
  es: {
    'page.title': 'Repositorio de Iniciativas en Salud Mental de las Universidades Valencianas',
    'page.description': 'Consulta de iniciativas universitarias de bienestar emocional y salud mental en las universidades valencianas.',
    'header.home': 'Inicio del repositorio',
    'header.logoAlt': 'Generalitat Valenciana — Conselleria de Educación, Cultura y Universidades',
    'header.title': 'Repositorio de Iniciativas en Salud Mental\nde las Universidades Valencianas',
    'language.label': 'Idioma',
    'intro.eyebrow': 'RECURSOS UNIVERSITARIOS · COMUNITAT VALENCIANA',
    'intro.title': 'Iniciativas para el bienestar emocional',
    'intro.description': 'Explora programas, recursos y acciones de las universidades valencianas para promover la salud mental de su comunidad.',
    'controls.eyebrow': 'EXPLORAR EL REPOSITORIO',
    'controls.title': 'Busca y filtra iniciativas',
    'filters.clear': 'Limpiar filtros',
    'filters.all': 'Todos',
    'filter.university': 'Universidad',
    'filter.scope': 'Ámbito de actuación',
    'filter.type': 'Tipo de actividad',
    'filter.timing': 'Temporalidad',
    'filter.funding': 'Financiación',
    'filter.audience': 'Población destinataria',
    'filter.space': 'Espacio de realización',
    'search.label': 'Búsqueda libre',
    'search.placeholder': 'ID, nombre, descripción, universidad o unidad',
    'sort.label': 'Ordenar',
    'sort.ariaLabel': 'Ordenar resultados',
    'sort.nameAsc': 'Nombre (A–Z)',
    'sort.nameDesc': 'Nombre (Z–A)',
    'sort.universityAsc': 'Universidad (A–Z)',
    'sort.universityDesc': 'Universidad (Z–A)',
    'results.title': 'Iniciativas',
    'results.one': '1 resultado',
    'results.many': '{count} resultados',
    'results.none': 'No hay iniciativas que coincidan con los criterios seleccionados.',
    'loadMore.label': 'Cargar más',
    'loadMore.progressOne': 'Mostrando 1 de 1 resultado',
    'loadMore.progressMany': 'Mostrando {visible} de {total} resultados',
    'loadMore.ariaOne': 'Cargar 1 iniciativa más. Se muestran {visible} de {total} resultados.',
    'loadMore.ariaMany': 'Cargar {amount} iniciativas más. Se muestran {visible} de {total} resultados.',
    'loadMore.announcementOne': 'Se ha cargado 1 iniciativa más. Se muestran {visible} de {total} resultados.',
    'loadMore.announcementMany': 'Se han cargado {amount} iniciativas más. Se muestran {visible} de {total} resultados.',
    'download.label': 'Descargar CSV filtrado',
    'download.ariaLabel': 'Descargar las iniciativas filtradas en CSV',
    'download.filename': 'iniciativas-salud-mental-filtradas.csv',
    'share.view': 'Copiar enlace de esta vista',
    'share.viewAria': 'Copiar enlace de la vista actual',
    'share.dialog': 'Copiar enlace de esta ficha',
    'share.dialogAria': 'Copiar enlace de la ficha {identifier}: {name}',
    'share.success': 'Enlace copiado.',
    'share.failure': 'No se ha podido copiar el enlace.',
    'url.idNotFound': 'No se ha encontrado la iniciativa solicitada.',
    'loading.short': 'Cargando…',
    'loading.long': 'Cargando iniciativas…',
    'error.short': 'No se han podido cargar las iniciativas.',
    'error.load': 'No se han podido cargar las iniciativas. Comprueba la conexión o la publicación del CSV e inténtalo de nuevo.',
    'error.console': 'No se pudo cargar el CSV:',
    'footer.heading': 'UNIVERSIDADES PARTICIPANTES',
    'footer.logosLabel': 'Universidades participantes',
    'footer.note': 'Desarrollado por la Universidad Miguel Hernández de Elche\nDelegación del Rector para Campus Saludables y Deportes',
    'dialog.eyebrow': 'FICHA DE LA INICIATIVA',
    'dialog.close': 'Cerrar ficha',
    'dialog.closeAria': 'Cerrar ficha de {identifier}',
    'card.details': 'Ver ficha →',
    'card.detailsAria': 'Ver ficha de {identifier}: {name}',
    'card.unnamed': 'Iniciativa sin nombre',
    'card.initiative': 'la iniciativa',
    'card.fallbackTag': 'Iniciativa',
    'detail.id': 'Identificador',
    'detail.university': 'Universidad',
    'detail.unit': 'Vicerrectorado o unidad funcional',
    'detail.technical': 'Unidad técnica, gestora o administrativa',
    'detail.description': 'Descripción',
    'detail.scope': 'Ámbito de actuación',
    'detail.type': 'Tipo de actividad',
    'detail.timing': 'Temporalidad',
    'detail.funding': 'Financiación',
    'detail.cost': 'Coste de la actuación',
    'detail.audience': 'Población destinataria',
    'detail.space': 'Espacio de realización',
    'detail.email': 'Correo electrónico de contacto',
    'detail.phone': 'Teléfono de contacto',
    'detail.url': 'Sitio web',
    'university.alicante': 'Universidad de Alicante',
    'warning.canonical': 'Valor canónico sin traducción valenciana en {field}: {value}'
  },
  va: {
    'page.title': 'Repositori d’Iniciatives en Salut Mental de les Universitats Valencianes',
    'page.description': 'Consulta d’iniciatives universitàries de benestar emocional i salut mental a les universitats valencianes.',
    'header.home': 'Inici del repositori',
    'header.logoAlt': 'Generalitat Valenciana — Conselleria d’Educació, Cultura i Universitats',
    'header.title': 'Repositori d’Iniciatives en Salut Mental\nde les Universitats Valencianes',
    'language.label': 'Llengua',
    'intro.eyebrow': 'RECURSOS UNIVERSITARIS · COMUNITAT VALENCIANA',
    'intro.title': 'Iniciatives per al benestar emocional',
    'intro.description': 'Explora programes, recursos i accions de les universitats valencianes per a promoure la salut mental de la seua comunitat.',
    'controls.eyebrow': 'EXPLORAR EL REPOSITORI',
    'controls.title': 'Busca i filtra iniciatives',
    'filters.clear': 'Neteja els filtres',
    'filters.all': 'Totes les opcions',
    'filter.university': 'Universitat',
    'filter.scope': 'Àmbit d’actuació',
    'filter.type': 'Tipus d’activitat',
    'filter.timing': 'Temporalitat',
    'filter.funding': 'Finançament',
    'filter.audience': 'Població destinatària',
    'filter.space': 'Espai de realització',
    'search.label': 'Cerca lliure',
    'search.placeholder': 'ID, nom, descripció, universitat o unitat',
    'sort.label': 'Ordena',
    'sort.ariaLabel': 'Ordena els resultats',
    'sort.nameAsc': 'Nom (A–Z)',
    'sort.nameDesc': 'Nom (Z–A)',
    'sort.universityAsc': 'Universitat (A–Z)',
    'sort.universityDesc': 'Universitat (Z–A)',
    'results.title': 'Iniciatives',
    'results.one': '1 resultat',
    'results.many': '{count} resultats',
    'results.none': 'No hi ha iniciatives que coincidisquen amb els criteris seleccionats.',
    'loadMore.label': 'Carrega’n més',
    'loadMore.progressOne': 'Mostrant 1 d’1 resultat',
    'loadMore.progressMany': 'Mostrant {visible} de {total} resultats',
    'loadMore.ariaOne': 'Carrega 1 iniciativa més. Se’n mostren {visible} de {total} resultats.',
    'loadMore.ariaMany': 'Carrega {amount} iniciatives més. Se’n mostren {visible} de {total} resultats.',
    'loadMore.announcementOne': 'S’ha carregat 1 iniciativa més. Se’n mostren {visible} de {total} resultats.',
    'loadMore.announcementMany': 'S’han carregat {amount} iniciatives més. Se’n mostren {visible} de {total} resultats.',
    'download.label': 'Descarrega el CSV filtrat',
    'download.ariaLabel': 'Descarrega les iniciatives filtrades en CSV',
    'download.filename': 'iniciatives-salut-mental-filtrades.csv',
    'share.view': 'Copia l’enllaç d’aquesta vista',
    'share.viewAria': 'Copia l’enllaç de la vista actual',
    'share.dialog': 'Copia l’enllaç d’aquesta fitxa',
    'share.dialogAria': 'Copia l’enllaç de la fitxa {identifier}: {name}',
    'share.success': 'Enllaç copiat.',
    'share.failure': 'No s’ha pogut copiar l’enllaç.',
    'url.idNotFound': 'No s’ha trobat la iniciativa sol·licitada.',
    'loading.short': 'Carregant…',
    'loading.long': 'Carregant iniciatives…',
    'error.short': 'No s’han pogut carregar les iniciatives.',
    'error.load': 'No s’han pogut carregar les iniciatives. Comprova la connexió o la publicació del CSV i torna-ho a intentar.',
    'error.console': 'No s’ha pogut carregar el CSV:',
    'footer.heading': 'UNIVERSITATS PARTICIPANTS',
    'footer.logosLabel': 'Universitats participants',
    'footer.note': 'Desenvolupat per la Universidad Miguel Hernández de Elche\nDelegació del Rector per a Campus Saludables i Esports',
    'dialog.eyebrow': 'FITXA DE LA INICIATIVA',
    'dialog.close': 'Tanca la fitxa',
    'dialog.closeAria': 'Tanca la fitxa de {identifier}',
    'card.details': 'Veure fitxa →',
    'card.detailsAria': 'Veure la fitxa de {identifier}: {name}',
    'card.unnamed': 'Iniciativa sense nom',
    'card.initiative': 'la iniciativa',
    'card.fallbackTag': 'Iniciativa',
    'detail.id': 'Identificador',
    'detail.university': 'Universitat',
    'detail.unit': 'Vicerectorat o unitat funcional',
    'detail.technical': 'Unitat tècnica, gestora o administrativa',
    'detail.description': 'Descripció',
    'detail.scope': 'Àmbit d’actuació',
    'detail.type': 'Tipus d’activitat',
    'detail.timing': 'Temporalitat',
    'detail.funding': 'Finançament',
    'detail.cost': 'Cost de l’actuació',
    'detail.audience': 'Població destinatària',
    'detail.space': 'Espai de realització',
    'detail.email': 'Adreça electrònica de contacte',
    'detail.phone': 'Telèfon de contacte',
    'detail.url': 'Lloc web',
    'university.alicante': 'Universitat d’Alacant',
    'warning.canonical': 'Valor canònic sense traducció valenciana en {field}: {value}'
  }
});

const FIELDS = Object.freeze({
  id: 'ID',
  university: 'Universidad',
  unit: 'Vicerrectorado/Unidad Funcional Dependiente',
  technical: 'Denominación Unidad Técnica, Gestora o Administrativa',
  email: 'Correo electrónico de contacto',
  phone: 'Teléfono de contacto',
  name: 'Nombre de la Actividad / Acción / Iniciativa',
  description: 'Descripción de la Actividad / Acción / Iniciativa (máx. 250 palabras)',
  url: 'Dirección Web / URL Específica',
  scope: 'Ámbito de Actuación',
  type: 'Tipo de Actividad',
  timing: 'Temporalidad',
  funding: 'Financiación',
  cost: 'Coste de la actuación',
  audience: 'Población destinataria',
  space: 'Espacio de realización',
  nameVa: "Nom de l'activitat / acció / iniciativa [VA]",
  descriptionVa: "Descripció de l'Activitat / Acció / Iniciativa [VA]",
  urlVa: 'Adreça web / URL específica [VA]'
});

const REQUIRED_FIELDS = Object.freeze([
  FIELDS.id,
  FIELDS.university,
  FIELDS.unit,
  FIELDS.technical,
  FIELDS.email,
  FIELDS.phone,
  FIELDS.name,
  FIELDS.description,
  FIELDS.url,
  FIELDS.scope,
  FIELDS.type,
  FIELDS.timing,
  FIELDS.funding,
  FIELDS.cost,
  FIELDS.audience,
  FIELDS.space
]);

const LOCALIZED_FIELDS = deepFreeze({
  va: {
    name: FIELDS.nameVa,
    description: FIELDS.descriptionVa,
    url: FIELDS.urlVa
  }
});

const FILTERS = Object.freeze([
  ['university', 'filter.university'],
  ['scope', 'filter.scope'],
  ['type', 'filter.type'],
  ['timing', 'filter.timing'],
  ['funding', 'filter.funding'],
  ['audience', 'filter.audience'],
  ['space', 'filter.space']
]);

const SEARCH_FIELD_KEYS = Object.freeze([
  'id',
  'university',
  'unit',
  'technical',
  'name',
  'nameVa',
  'description',
  'descriptionVa'
]);

const DETAIL_FIELDS = Object.freeze([
  ['id', 'detail.id'],
  ['university', 'detail.university'],
  ['unit', 'detail.unit'],
  ['technical', 'detail.technical'],
  ['description', 'detail.description'],
  ['scope', 'detail.scope'],
  ['type', 'detail.type'],
  ['timing', 'detail.timing'],
  ['funding', 'detail.funding'],
  ['cost', 'detail.cost'],
  ['audience', 'detail.audience'],
  ['space', 'detail.space'],
  ['email', 'detail.email'],
  ['phone', 'detail.phone'],
  ['url', 'detail.url']
]);

const CANONICAL_VALUE_TRANSLATIONS = deepFreeze({
  scope: {
    'Acompañamiento / Intervención': 'Acompanyament / Intervenció',
    'Detección / Derivación': 'Detecció / Derivació',
    'Entorno saludable / Psicosocial': 'Entorn saludable / Psicosocial',
    'Prevención de problemas de salud mental': 'Prevenció de problemes de salut mental',
    'Promoción de la salud mental': 'Promoció de la salut mental'
  },
  type: {
    'Asesoramiento / Atención Psicológica': 'Assessorament / Atenció psicològica',
    'Formación (Curso / Taller)': 'Formació (Curs / Taller)',
    'Guía de actuación / Protocolo': 'Guia d’actuació / Protocol',
    'Jornada / Divulgación': 'Jornada / Divulgació',
    'Recursos institucionales de apoyo y orientación': 'Recursos institucionals de suport i orientació'
  },
  timing: {
    Anual: 'Anual',
    'Estructural (i.e., repetible de forma periódica)': 'Estructural (és a dir, repetible de manera periòdica)',
    Puntual: 'Puntual',
    Semestral: 'Semestral'
  },
  funding: {
    'Fondos propios': 'Fons propis',
    'Pago de las personas participantes': 'Pagament de les persones participants',
    'Subvenciones externas': 'Subvencions externes'
  },
  cost: {
    '1000€': '1000€',
    '1001 - 3000€': '1001 - 3000€',
    '> 3001€': '> 3001€',
    Gratuita: 'Gratuïta',
    'No especificado / No aplica': 'No especificat / No aplicable'
  },
  audience: {
    Alumni: 'Alumni',
    Estudiantado: 'Estudiantat',
    PDI: 'PDI',
    PI: 'PI',
    PTGAS: 'PTGAS',
    'Toda la ciudadanía': 'Tota la ciutadania'
  },
  space: {
    'Espacio interior del campus I: aula o espacio docente equivalente': 'Espai interior del campus I: aula o espai docent equivalent',
    'Espacio interior del campus II: espacio comunitario': 'Espai interior del campus II: espai comunitari',
    'Instalación o espacio fuera del campus': 'Instal·lació o espai fora del campus',
    'No especificado / No aplica': 'No especificat / No aplicable',
    Online: 'En línia'
  }
});

const state = {
  headers: [],
  rows: [],
  filtered: [],
  language: 'es',
  loaded: false,
  loadError: null,
  dialogRow: null,
  idLookup: new Map(),
  ambiguousIds: new Set(),
  filterOptions: new Map(),
  urlNoticeKey: '',
  applyingUrl: false,
  visibleCount: 0,
  listSignature: ''
};

const canonicalWarnings = new Set();
const cardTriggers = new Map();
let lastDialogTrigger = null;
let searchUrlTimer = null;
let liveMessageTimer = null;
let loadMoreMessageTimer = null;

const $ = (id) => document.getElementById(id);

function t(key, parameters = {}) {
  const languageDictionary = TRANSLATIONS[state.language] || TRANSLATIONS.es;
  const template = languageDictionary[key] ?? TRANSLATIONS.es[key] ?? key;

  return String(template).replace(/\{([a-zA-Z0-9_-]+)\}/g, (match, parameter) => (
    Object.prototype.hasOwnProperty.call(parameters, parameter)
      ? String(parameters[parameter] ?? '')
      : match
  ));
}

function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function display(value) {
  return String(value ?? '').trim();
}

function sanitizeUrlQuery(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, QUERY_MAX_LENGTH);
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      quoted = !quoted;
      continue;
    }

    if (character === ',' && !quoted) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(cell);
      cell = '';
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      continue;
    }

    cell += character;
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim() !== '')) rows.push(row);
  }

  return rows;
}

function column(row, name) {
  const index = state.headers.indexOf(name);
  return index < 0 ? '' : row[index] ?? '';
}

function localizedColumn(row, key, language = state.language) {
  const localizedField = LOCALIZED_FIELDS[language]?.[key];
  const localizedValue = localizedField ? display(column(row, localizedField)) : '';
  return localizedValue || column(row, FIELDS[key]);
}

function values(row, key) {
  return column(row, FIELDS[key]).split('|').map(display).filter(Boolean);
}

function translateCanonicalValue(key, value) {
  const original = display(value);
  if (!original) return original;

  if (key === 'university') {
    return ['Universidad de Alicante', "Universitat d'Alacant"].includes(original)
      ? t('university.alicante')
      : original;
  }

  if (state.language !== 'va') return original;

  const translations = CANONICAL_VALUE_TRANSLATIONS[key];
  if (!translations) return original;
  if (Object.prototype.hasOwnProperty.call(translations, original)) return translations[original];

  const warningKey = `${key}\u0000${original}`;
  if (!canonicalWarnings.has(warningKey)) {
    canonicalWarnings.add(warningKey);
    console.warn(t('warning.canonical', { field: key, value: original }));
  }
  return original;
}

function localizedListText(key, value) {
  return String(value ?? '')
    .split('|')
    .map(display)
    .filter(Boolean)
    .map((part) => translateCanonicalValue(key, part))
    .join(' · ');
}

function readStoredLanguage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || '';
  } catch (error) {
    return '';
  }
}

function writeStoredLanguage(language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch (error) {
    // El almacenamiento es opcional; la URL conserva el idioma activo.
  }
}

function readUrlState(source = window.location.href) {
  const url = new URL(source, window.location.href);
  const urlState = {};

  URL_PARAM_ORDER.forEach((parameter) => {
    urlState[parameter] = url.searchParams.get(parameter) ?? '';
  });

  return urlState;
}

function resolveInitialLanguage(urlLanguage = '') {
  if (VALID_LANGUAGES.includes(urlLanguage)) return urlLanguage;

  const storedLanguage = readStoredLanguage();
  return VALID_LANGUAGES.includes(storedLanguage) ? storedLanguage : 'es';
}

function findRowById(value) {
  const raw = String(value ?? '');
  if (!raw.trim() || /[\u0000-\u001f\u007f]/.test(raw)) return null;

  const normalizedId = raw.trim().toLowerCase();
  if (state.ambiguousIds.has(normalizedId)) return null;
  return state.idLookup.get(normalizedId) || null;
}

function sanitizeUrlState(rawState, { dataReady = state.loaded } = {}) {
  const sanitized = {
    lang: VALID_LANGUAGES.includes(rawState.lang)
      ? rawState.lang
      : resolveInitialLanguage(rawState.lang),
    q: sanitizeUrlQuery(rawState.q),
    sort: SORT_VALUES.includes(rawState.sort) ? rawState.sort : 'name-asc',
    id: '',
    invalidIdRequested: false
  };

  FILTERS.forEach(([key]) => {
    const candidate = String(rawState[key] ?? '');
    sanitized[key] = dataReady && state.filterOptions.get(key)?.has(candidate) ? candidate : '';
  });

  if (dataReady) {
    const requestedId = String(rawState.id ?? '');
    const trimmedId = requestedId.trim();
    if (trimmedId) {
      const row = findRowById(requestedId);
      if (row) {
        sanitized.id = display(column(row, FIELDS.id));
      } else {
        sanitized.invalidIdRequested = true;
      }
    }
  }

  return sanitized;
}

function collectInterfaceState() {
  const interfaceState = {
    lang: state.language,
    q: sanitizeUrlQuery($('search').value),
    sort: SORT_VALUES.includes($('sort').value) ? $('sort').value : 'name-asc',
    id: state.dialogRow && $('initiative-dialog').open
      ? display(column(state.dialogRow, FIELDS.id))
      : ''
  };

  FILTERS.forEach(([key]) => {
    const select = $(`filter-${key}`);
    interfaceState[key] = select?.value || '';
  });

  return interfaceState;
}

function getListStateSignature(interfaceState = collectInterfaceState()) {
  const listState = {
    q: sanitizeUrlQuery(interfaceState.q),
    sort: SORT_VALUES.includes(interfaceState.sort) ? interfaceState.sort : 'name-asc'
  };

  FILTERS.forEach(([key]) => {
    listState[key] = String(interfaceState[key] ?? '');
  });

  return JSON.stringify(listState);
}

function createCanonicalUrl(interfaceState, { includeId = true } = {}) {
  const url = new URL(window.location.href);
  const unknownParameters = [];

  url.searchParams.forEach((value, key) => {
    if (!URL_PARAM_SET.has(key)) unknownParameters.push([key, value]);
  });

  const parameters = new URLSearchParams();
  parameters.set('lang', VALID_LANGUAGES.includes(interfaceState.lang) ? interfaceState.lang : 'es');

  const query = sanitizeUrlQuery(interfaceState.q);
  if (query) parameters.set('q', query);

  FILTERS.forEach(([key]) => {
    const value = String(interfaceState[key] ?? '');
    if (value) parameters.set(key, value);
  });

  if (SORT_VALUES.includes(interfaceState.sort) && interfaceState.sort !== 'name-asc') {
    parameters.set('sort', interfaceState.sort);
  }

  if (includeId && interfaceState.id) parameters.set('id', interfaceState.id);
  unknownParameters.forEach(([key, value]) => parameters.append(key, value));
  url.search = parameters.toString();
  return url;
}

function isDialogHistoryEntry() {
  return Boolean(window.history.state?.[HISTORY_STATE_KEY]?.dialog);
}

function createHistoryState(dialogEntry) {
  const currentState = window.history.state;

  if (!dialogEntry) {
    if (!currentState || typeof currentState !== 'object' || Array.isArray(currentState)) return currentState;
    const ownState = currentState[HISTORY_STATE_KEY];
    const nextState = { ...currentState };
    delete nextState[HISTORY_STATE_KEY];
    if (ownState && Object.prototype.hasOwnProperty.call(ownState, 'foreignState') && Object.keys(nextState).length === 0) {
      return ownState.foreignState;
    }
    return nextState;
  }

  const canMergeState = currentState && typeof currentState === 'object' && !Array.isArray(currentState);
  const nextState = canMergeState
    ? { ...currentState }
    : {};
  nextState[HISTORY_STATE_KEY] = { dialog: true };
  if (currentState != null && !canMergeState) {
    nextState[HISTORY_STATE_KEY].foreignState = currentState;
  }
  return nextState;
}

function writeUrlState(mode, interfaceState = collectInterfaceState(), options = {}) {
  const url = createCanonicalUrl(interfaceState, options);
  const dialogEntry = options.dialogEntry ?? (Boolean(interfaceState.id) && isDialogHistoryEntry());
  const historyState = createHistoryState(dialogEntry);
  const relativeUrl = `${url.pathname}${url.search}${url.hash}`;

  if (mode === 'push') {
    window.history.pushState(historyState, '', relativeUrl);
  } else {
    window.history.replaceState(historyState, '', relativeUrl);
  }

  return url.href;
}

function applyStaticTranslations() {
  document.documentElement.lang = LANGUAGE_CONFIG[state.language].documentLanguage;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute('content', t('page.description'));

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    if ((state.loaded || state.loadError) && ['result-count', 'status'].includes(element.id)) return;
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder));
  });

  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    element.setAttribute('alt', t(element.dataset.i18nAlt));
  });

  $('language-select').value = state.language;
  renderUrlNotice();
  updateDocumentTitle();
}

function updateDocumentTitle() {
  if (!state.dialogRow || !$('initiative-dialog').open) {
    document.title = t('page.title');
    return;
  }

  const name = display(localizedColumn(state.dialogRow, 'name')) || t('card.unnamed');
  document.title = `${name} | ${t('page.title')}`;
}

function renderUrlNotice() {
  $('url-notice').textContent = state.urlNoticeKey ? t(state.urlNoticeKey) : '';
}

function clearUrlNotice() {
  state.urlNoticeKey = '';
  renderUrlNotice();
}

function announceCopyResult(success) {
  const region = $('copy-status');
  window.clearTimeout(liveMessageTimer);
  region.textContent = '';
  liveMessageTimer = window.setTimeout(() => {
    region.textContent = t(success ? 'share.success' : 'share.failure');
  }, 20);
}

function buildDataIndexes() {
  state.idLookup = new Map();
  state.ambiguousIds = new Set();
  state.filterOptions = new Map();

  state.rows.forEach((row) => {
    const id = display(column(row, FIELDS.id));
    if (id) {
      const normalizedId = id.toLowerCase();
      if (state.idLookup.has(normalizedId)) {
        state.ambiguousIds.add(normalizedId);
        state.idLookup.delete(normalizedId);
      } else if (!state.ambiguousIds.has(normalizedId)) {
        state.idLookup.set(normalizedId, row);
      }
    }
  });

  state.ambiguousIds.forEach((id) => {
    console.error(`No se puede abrir mediante URL el identificador duplicado: ${id}`);
  });

  FILTERS.forEach(([key]) => {
    state.filterOptions.set(key, new Set(state.rows.flatMap((row) => values(row, key))));
  });
}

function currentFilterSelections() {
  const selections = {};
  $('filters').querySelectorAll('select').forEach((select) => {
    selections[select.dataset.filter] = select.value;
  });
  return selections;
}

function buildFilters(selections = {}) {
  const container = $('filters');
  const locale = LANGUAGE_CONFIG[state.language].locale;
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  container.replaceChildren();

  FILTERS.forEach(([key, labelKey]) => {
    const options = [...(state.filterOptions.get(key) || [])]
      .map((canonical) => ({ canonical, visible: translateCanonicalValue(key, canonical) }))
      .sort((first, second) => collator.compare(first.visible, second.visible));
    const wrapper = document.createElement('div');
    const label = document.createElement('label');
    const select = document.createElement('select');
    const allOption = document.createElement('option');
    const id = `filter-${key}`;

    wrapper.className = 'filter-field';
    label.htmlFor = id;
    label.textContent = t(labelKey);
    select.id = id;
    select.dataset.filter = key;
    allOption.value = '';
    allOption.textContent = t('filters.all');
    select.append(allOption);

    options.forEach(({ canonical, visible }) => {
      const option = document.createElement('option');
      option.value = canonical;
      option.textContent = visible;
      select.append(option);
    });

    select.value = selections[key] || '';
    select.addEventListener('change', () => handleInterfaceChange('push'));
    wrapper.append(label, select);
    container.append(wrapper);
  });
}

function applyFilters({ resetProgress = true } = {}) {
  const query = normalizeSearch($('search').value);
  const selected = {};

  $('filters').querySelectorAll('select').forEach((select) => {
    selected[select.dataset.filter] = normalizeSearch(select.value);
  });

  state.filtered = state.rows.filter((row) => {
    const searchableValues = SEARCH_FIELD_KEYS.map((key) => column(row, FIELDS[key]));
    const university = display(column(row, FIELDS.university));
    searchableValues.push(translateCanonicalValue('university', university));
    if (['Universidad de Alicante', "Universitat d'Alacant"].includes(university)) {
      searchableValues.push(
        TRANSLATIONS.es['university.alicante'],
        TRANSLATIONS.va['university.alicante']
      );
    }
    const searchableText = normalizeSearch(searchableValues.join(' '));
    const matchesSearch = !query || searchableText.includes(query);
    const matchesFilters = FILTERS.every(([key]) => (
      !selected[key] || values(row, key).some((value) => normalizeSearch(value) === selected[key])
    ));
    return matchesSearch && matchesFilters;
  });

  sortRows();
  const listSignature = getListStateSignature();
  if (resetProgress || listSignature !== state.listSignature) {
    state.visibleCount = Math.min(RESULTS_BATCH_SIZE, state.filtered.length);
  } else {
    state.visibleCount = Math.min(state.visibleCount || RESULTS_BATCH_SIZE, state.filtered.length);
  }
  state.listSignature = listSignature;
  renderVisibleResults();
}

function sortRows() {
  const [field, direction] = $('sort').value.split('-');
  const multiplier = direction === 'desc' ? -1 : 1;
  const locale = LANGUAGE_CONFIG[state.language].locale;
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });

  state.filtered.sort((first, second) => {
    const firstValue = field === 'name'
      ? localizedColumn(first, 'name')
      : translateCanonicalValue('university', column(first, FIELDS.university));
    const secondValue = field === 'name'
      ? localizedColumn(second, 'name')
      : translateCanonicalValue('university', column(second, FIELDS.university));
    return collator.compare(firstValue, secondValue) * multiplier;
  });
}

function updateLoadMoreControls() {
  const controls = $('load-more-controls');
  const progress = $('load-more-progress');
  const button = $('load-more');
  const total = state.filtered.length;
  const visible = Math.min(state.visibleCount, total);

  if (total === 0) {
    controls.hidden = true;
    button.hidden = true;
    progress.textContent = '';
    $('load-more-status').textContent = '';
    return;
  }

  controls.hidden = false;
  progress.textContent = total === 1
    ? t('loadMore.progressOne')
    : t('loadMore.progressMany', { visible, total });

  const remaining = total - visible;
  const amount = Math.min(RESULTS_BATCH_SIZE, remaining);
  button.hidden = remaining === 0;
  button.textContent = t('loadMore.label');
  if (remaining > 0) {
    button.setAttribute('aria-label', t(amount === 1 ? 'loadMore.ariaOne' : 'loadMore.ariaMany', {
      amount,
      visible,
      total
    }));
  } else {
    button.removeAttribute('aria-label');
  }
}

function renderVisibleResults() {
  const cards = $('cards');
  const resultCount = state.filtered.length;

  window.clearTimeout(loadMoreMessageTimer);
  $('load-more-status').textContent = '';
  cards.replaceChildren();
  cardTriggers.clear();
  $('result-count').textContent = resultCount === 1
    ? t('results.one')
    : t('results.many', { count: resultCount });
  $('download-csv').disabled = resultCount === 0;
  $('copy-view-link').disabled = false;
  $('status').className = 'status';

  if (resultCount === 0) {
    $('status').textContent = t('results.none');
    updateLoadMoreControls();
    return;
  }

  $('status').textContent = '';
  const fragment = document.createDocumentFragment();
  state.filtered.slice(0, state.visibleCount).forEach((row) => fragment.append(createCard(row)));
  cards.append(fragment);
  updateLoadMoreControls();

  if (state.dialogRow) {
    const dialogId = display(column(state.dialogRow, FIELDS.id));
    const replacementTrigger = cardTriggers.get(dialogId);
    if (replacementTrigger) lastDialogTrigger = replacementTrigger;
  }
}

function announceLoadedBatch(amount) {
  const region = $('load-more-status');
  const total = state.filtered.length;
  const visible = Math.min(state.visibleCount, total);
  window.clearTimeout(loadMoreMessageTimer);
  region.textContent = '';
  loadMoreMessageTimer = window.setTimeout(() => {
    region.textContent = t(amount === 1 ? 'loadMore.announcementOne' : 'loadMore.announcementMany', {
      amount,
      visible,
      total
    });
  }, 20);
}

function loadNextBatch() {
  const button = $('load-more');
  const hadButtonFocus = document.activeElement === button;
  const previousVisibleCount = state.visibleCount;
  const nextVisibleCount = Math.min(previousVisibleCount + RESULTS_BATCH_SIZE, state.filtered.length);
  if (nextVisibleCount <= previousVisibleCount) return;

  const fragment = document.createDocumentFragment();
  state.filtered.slice(previousVisibleCount, nextVisibleCount).forEach((row) => fragment.append(createCard(row)));
  $('cards').append(fragment);
  state.visibleCount = nextVisibleCount;
  updateLoadMoreControls();
  announceLoadedBatch(nextVisibleCount - previousVisibleCount);

  if (hadButtonFocus && button.hidden) {
    $('load-more-progress').focus({ preventScroll: true });
  }
}

function createCard(row) {
  const id = display(column(row, FIELDS.id));
  const name = display(localizedColumn(row, 'name')) || t('card.unnamed');
  const description = display(localizedColumn(row, 'description'));
  const article = document.createElement('article');
  const metadata = document.createElement('div');
  const university = document.createElement('span');
  const identifier = document.createElement('span');
  const title = document.createElement('h3');
  const summary = document.createElement('p');
  const footer = document.createElement('div');
  const tag = document.createElement('span');
  const button = document.createElement('button');

  article.className = 'card';
  metadata.className = 'card-meta';
  university.textContent = translateCanonicalValue('university', column(row, FIELDS.university));
  identifier.textContent = id;
  metadata.append(university, identifier);

  title.textContent = name;
  summary.textContent = description.length > 190 ? `${description.slice(0, 187)}…` : description;

  footer.className = 'card-footer';
  tag.className = 'tag';
  tag.textContent = localizedListText('type', column(row, FIELDS.type)) || t('card.fallbackTag');

  button.className = 'details-link';
  button.type = 'button';
  button.textContent = t('card.details');
  button.setAttribute('aria-label', t('card.detailsAria', {
    identifier: id || t('card.initiative'),
    name
  }));
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', 'initiative-dialog');
  button.addEventListener('click', () => openDialogFromCard(row, button));

  if (id) cardTriggers.set(id, button);
  footer.append(tag, button);
  article.append(metadata, title, summary, footer);
  return article;
}

function parseSafeHttpUrl(value) {
  const raw = String(value ?? '');
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;
  const text = raw.trim();
  if (!text || !/^https?:\/\//i.test(text)) return null;

  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    return url;
  } catch (error) {
    return null;
  }
}

function validateEmail(value) {
  const raw = String(value ?? '');
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;
  const email = raw.trim();
  if (!email || email.length > 254 || /\s/.test(email)) return null;

  const atIndex = email.lastIndexOf('@');
  if (atIndex < 1 || atIndex !== email.indexOf('@')) return null;
  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  const localPattern = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/i;
  const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

  if (localPart.length > 64 || localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) return null;
  if (!localPattern.test(localPart) || !domainPattern.test(domain)) return null;
  return email;
}

function normalizePhone(value) {
  const raw = String(value ?? '');
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;
  const phone = raw.trim();
  if (!phone) return null;
  if (!/^\+?[\d\s().-]+$/.test(phone)) return null;

  const normalized = phone.replace(/[\s().-]/g, '');
  const digits = normalized.replace(/^\+/, '');
  if (!/^\+?\d+$/.test(normalized) || digits.length < 6 || digits.length > 15) return null;
  return normalized;
}

function createLink(text, href, external = false) {
  const link = document.createElement('a');
  link.textContent = text;
  link.setAttribute('href', href);

  if (external) {
    link.className = 'external-link';
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  } else {
    link.className = 'contact-link';
  }

  return link;
}

function createSafeValueNode(key, value) {
  const text = display(value);

  if (key === 'url') {
    const url = parseSafeHttpUrl(value);
    return url ? createLink(text, url.href, true) : document.createTextNode(text);
  }

  if (key === 'email') {
    const email = validateEmail(value);
    return email ? createLink(email, `mailto:${email}`) : document.createTextNode(text);
  }

  if (key === 'phone') {
    const phone = normalizePhone(value);
    return phone ? createLink(text, `tel:${phone}`) : document.createTextNode(text);
  }

  return document.createTextNode(translateCanonicalValue(key, text));
}

function renderFieldValue(container, key, value) {
  const parts = String(value).split('|').filter((part) => display(part));

  if (parts.length <= 1) {
    container.append(createSafeValueNode(key, parts[0] ?? value));
    return;
  }

  const list = document.createElement('ul');
  list.className = 'detail-list';
  parts.forEach((part) => {
    const item = document.createElement('li');
    item.append(createSafeValueNode(key, part));
    list.append(item);
  });
  container.append(list);
}

function renderDetailField(row, key, labelKey) {
  const sourceValue = ['description', 'url'].includes(key)
    ? localizedColumn(row, key)
    : column(row, FIELDS[key]);
  const value = display(sourceValue);
  if (!value) return null;

  const item = document.createElement('div');
  const label = document.createElement('dt');
  const content = document.createElement('dd');

  item.className = `detail-item${key === 'description' ? ' full' : ''}`;
  label.textContent = t(labelKey);
  renderFieldValue(content, key, value);
  item.append(label, content);
  return item;
}

function renderDialogContent(row) {
  const content = $('dialog-content');
  const closeButton = $('close-dialog');
  const copyButton = $('copy-dialog-link');
  const id = display(column(row, FIELDS.id));
  const name = display(localizedColumn(row, 'name')) || t('card.unnamed');
  const title = document.createElement('h2');
  const details = document.createElement('dl');

  title.id = 'dialog-title';
  title.className = 'dialog-title';
  title.textContent = name;
  details.className = 'detail-grid';

  DETAIL_FIELDS.forEach(([key, labelKey]) => {
    const field = renderDetailField(row, key, labelKey);
    if (field) details.append(field);
  });

  closeButton.setAttribute('aria-label', t('dialog.closeAria', { identifier: id || name }));
  copyButton.disabled = false;
  copyButton.textContent = t('share.dialog');
  copyButton.setAttribute('aria-label', t('share.dialogAria', {
    identifier: id || t('card.initiative'),
    name
  }));
  content.replaceChildren(title, details);
}

function openDialog(row, trigger) {
  const dialog = $('initiative-dialog');
  state.dialogRow = row;
  if (trigger) lastDialogTrigger = trigger;
  renderDialogContent(row);
  if (!dialog.open) dialog.showModal();
  updateDocumentTitle();
  $('close-dialog').focus({ preventScroll: true });
}

function openDialogFromCard(row, trigger) {
  const interfaceState = collectInterfaceState();
  interfaceState.id = display(column(row, FIELDS.id));
  clearUrlNotice();
  writeUrlState('push', interfaceState, { dialogEntry: true });
  openDialog(row, trigger);
}

function closeDialogVisual() {
  const dialog = $('initiative-dialog');
  if (dialog.open) {
    dialog.close();
    return;
  }

  state.dialogRow = null;
  lastDialogTrigger = null;
  $('copy-dialog-link').disabled = true;
  updateDocumentTitle();
}

function requestDialogClose() {
  if (!$('initiative-dialog').open) return;

  if (isDialogHistoryEntry()) {
    window.history.back();
    return;
  }

  const interfaceState = collectInterfaceState();
  interfaceState.id = '';
  writeUrlState('replace', interfaceState, { dialogEntry: false });
  closeDialogVisual();
}

function restoreDialogFocus() {
  const trigger = lastDialogTrigger;
  state.dialogRow = null;
  lastDialogTrigger = null;
  $('copy-dialog-link').disabled = true;
  updateDocumentTitle();
  if (trigger?.isConnected && typeof trigger.focus === 'function') {
    trigger.focus({ preventScroll: true });
  } else {
    $('search').focus({ preventScroll: true });
  }
}

function fallbackCopyText(text) {
  const previouslyFocused = document.activeElement;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.readOnly = true;
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (error) {
    copied = false;
  }

  textarea.remove();
  if (previouslyFocused?.isConnected && typeof previouslyFocused.focus === 'function') {
    previouslyFocused.focus({ preventScroll: true });
  }
  return copied;
}

async function copyText(text, services = {}) {
  const clipboard = Object.prototype.hasOwnProperty.call(services, 'clipboard')
    ? services.clipboard
    : navigator.clipboard;
  const fallback = services.fallback || fallbackCopyText;

  try {
    if (clipboard?.writeText) {
      await clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    // Continúa con el respaldo compatible con navegadores antiguos.
  }

  return fallback(text);
}

async function copyCurrentLink(includeId) {
  const interfaceState = collectInterfaceState();
  if (!includeId) interfaceState.id = '';
  const url = createCanonicalUrl(interfaceState, { includeId });
  announceCopyResult(await copyText(url.href));
}

function downloadCSV() {
  const separator = ';';
  const lines = [state.headers, ...state.filtered].map((row) => (
    row.map((value) => {
      const text = String(value ?? '');
      return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }).join(separator)
  ));
  const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);

  link.href = objectUrl;
  link.download = t('download.filename');
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function renderLoadError() {
  $('result-count').textContent = t('error.short');
  $('download-csv').disabled = true;
  $('copy-view-link').disabled = true;
  $('status').className = 'status error';
  $('status').textContent = t('error.load');
  $('load-more-controls').hidden = true;
  $('load-more-status').textContent = '';
}

function setLanguage(language, { updateUrl = true } = {}) {
  if (!VALID_LANGUAGES.includes(language)) return;

  const selections = state.loaded ? currentFilterSelections() : {};
  state.language = language;
  writeStoredLanguage(language);
  $('copy-status').textContent = '';
  applyStaticTranslations();

  if (state.loaded) {
    buildFilters(selections);
    applyFilters({ resetProgress: false });
    if ($('initiative-dialog').open && state.dialogRow) {
      renderDialogContent(state.dialogRow);
      updateDocumentTitle();
    }
  } else if (state.loadError) {
    renderLoadError();
  }

  if (updateUrl) {
    const urlState = state.loaded
      ? collectInterfaceState()
      : { ...readUrlState(), lang: language };
    writeUrlState('replace', urlState, {
      dialogEntry: Boolean(urlState.id) && isDialogHistoryEntry()
    });
  }
}

function applyUrlState(rawState = readUrlState()) {
  if (!state.loaded || state.applyingUrl) return;

  window.clearTimeout(searchUrlTimer);
  const sanitized = sanitizeUrlState(rawState);
  state.applyingUrl = true;

  try {
    state.urlNoticeKey = sanitized.invalidIdRequested ? 'url.idNotFound' : '';
    state.language = sanitized.lang;
    writeStoredLanguage(state.language);
    $('search').value = sanitized.q;
    $('sort').value = sanitized.sort;
    const shouldResetProgress = getListStateSignature(sanitized) !== state.listSignature;
    applyStaticTranslations();
    buildFilters(sanitized);
    applyFilters({ resetProgress: shouldResetProgress });

    const row = sanitized.id ? findRowById(sanitized.id) : null;
    if (row) {
      const trigger = isDialogHistoryEntry() ? cardTriggers.get(sanitized.id) || null : null;
      openDialog(row, trigger);
    } else if ($('initiative-dialog').open) {
      closeDialogVisual();
    } else {
      state.dialogRow = null;
      updateDocumentTitle();
    }

    writeUrlState('replace', sanitized, {
      dialogEntry: Boolean(sanitized.id) && isDialogHistoryEntry()
    });
  } finally {
    state.applyingUrl = false;
  }
}

function handlePopState() {
  if (!state.loaded) return;
  applyUrlState(readUrlState());
}

function handleInterfaceChange(mode) {
  if (!state.loaded || state.applyingUrl) return;
  clearUrlNotice();
  applyFilters();
  writeUrlState(mode);
}

function handleSearchInput() {
  if (!state.loaded || state.applyingUrl) return;
  clearUrlNotice();
  applyFilters();
  window.clearTimeout(searchUrlTimer);
  searchUrlTimer = window.setTimeout(() => writeUrlState('replace'), SEARCH_URL_DELAY);
}

function clearFilters() {
  window.clearTimeout(searchUrlTimer);
  $('search').value = '';
  $('sort').value = 'name-asc';
  $('filters').querySelectorAll('select').forEach((select) => {
    select.value = '';
  });
  clearUrlNotice();
  applyFilters();

  const interfaceState = collectInterfaceState();
  interfaceState.id = '';
  writeUrlState('push', interfaceState, { dialogEntry: false });
  if ($('initiative-dialog').open) closeDialogVisual();
}

async function init() {
  try {
    const response = await fetch(CSV_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const parsed = parseCSV(await response.text());
    if (parsed.length === 0) throw new Error('El CSV no contiene filas.');

    state.headers = parsed.shift().map(display);
    state.rows = parsed.filter((row) => row.some((value) => display(value)));

    const missing = REQUIRED_FIELDS.filter((field) => !state.headers.includes(field));
    if (missing.length) throw new Error(`Faltan columnas esperadas: ${missing.join(', ')}`);

    state.loaded = true;
    buildDataIndexes();
    applyUrlState(readUrlState());
  } catch (error) {
    state.loadError = error;
    console.error(t('error.console'), error);
    renderLoadError();
  }
}

$('search').addEventListener('input', handleSearchInput);
$('sort').addEventListener('change', () => handleInterfaceChange('push'));
$('language-select').addEventListener('change', (event) => setLanguage(event.target.value));
$('download-csv').addEventListener('click', downloadCSV);
$('copy-view-link').addEventListener('click', () => copyCurrentLink(false));
$('copy-dialog-link').addEventListener('click', () => copyCurrentLink(true));
$('clear-filters').addEventListener('click', clearFilters);
$('load-more').addEventListener('click', loadNextBatch);
$('close-dialog').addEventListener('click', requestDialogClose);
$('initiative-dialog').addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    requestDialogClose();
  }
});
$('initiative-dialog').addEventListener('cancel', (event) => {
  event.preventDefault();
  requestDialogClose();
});
$('initiative-dialog').addEventListener('close', restoreDialogFocus);
window.addEventListener('popstate', handlePopState);

const initialUrlState = readUrlState();
const initialInterfaceState = sanitizeUrlState(initialUrlState, { dataReady: false });
state.language = initialInterfaceState.lang;
$('search').value = initialInterfaceState.q;
$('sort').value = initialInterfaceState.sort;
writeStoredLanguage(state.language);
applyStaticTranslations();
init();
