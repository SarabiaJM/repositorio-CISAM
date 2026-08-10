const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTF3wBIZH3SrknpKPNrTUpornzkLmFa7Pm0g40-V4gPZSv4ILdpGfnpZtsY2K0OZNxbljAvlaGoxZNr/pub?gid=953634781&single=true&output=csv';

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
  space: 'Espacio de realización'
});

const FILTERS = Object.freeze([
  ['university', 'Universidad'],
  ['scope', 'Ámbito de actuación'],
  ['type', 'Tipo de actividad'],
  ['timing', 'Temporalidad'],
  ['funding', 'Financiación'],
  ['audience', 'Población destinataria'],
  ['space', 'Espacio de realización']
]);

const SEARCH_FIELDS = Object.freeze([
  FIELDS.id,
  FIELDS.university,
  FIELDS.unit,
  FIELDS.technical,
  FIELDS.name,
  FIELDS.description
]);

const DETAIL_FIELDS = Object.freeze([
  ['id', 'Identificador'],
  ['university', 'Universidad'],
  ['unit', 'Vicerrectorado o unidad funcional'],
  ['technical', 'Unidad técnica, gestora o administrativa'],
  ['description', 'Descripción'],
  ['scope', 'Ámbito de actuación'],
  ['type', 'Tipo de actividad'],
  ['timing', 'Temporalidad'],
  ['funding', 'Financiación'],
  ['cost', 'Coste de la actuación'],
  ['audience', 'Población destinataria'],
  ['space', 'Espacio de realización'],
  ['email', 'Correo electrónico de contacto'],
  ['phone', 'Teléfono de contacto'],
  ['url', 'Sitio web']
]);

const state = {
  headers: [],
  rows: [],
  filtered: []
};

let lastDialogTrigger = null;

const $ = (id) => document.getElementById(id);

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

function values(row, key) {
  return column(row, FIELDS[key]).split('|').map(display).filter(Boolean);
}

function buildFilters() {
  const container = $('filters');
  container.replaceChildren();

  FILTERS.forEach(([key, labelText]) => {
    const options = [...new Set(state.rows.flatMap((row) => values(row, key)))]
      .sort((first, second) => normalizeSearch(first).localeCompare(normalizeSearch(second), 'es'));
    const wrapper = document.createElement('div');
    const label = document.createElement('label');
    const select = document.createElement('select');
    const allOption = document.createElement('option');
    const id = `filter-${key}`;

    wrapper.className = 'filter-field';
    label.htmlFor = id;
    label.textContent = labelText;
    select.id = id;
    select.dataset.filter = key;
    allOption.value = '';
    allOption.textContent = 'Todos';
    select.append(allOption);

    options.forEach((optionText) => {
      const option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      select.append(option);
    });

    select.addEventListener('change', applyFilters);
    wrapper.append(label, select);
    container.append(wrapper);
  });
}

function applyFilters() {
  const query = normalizeSearch($('search').value);
  const selected = {};

  $('filters').querySelectorAll('select').forEach((select) => {
    selected[select.dataset.filter] = normalizeSearch(select.value);
  });

  state.filtered = state.rows.filter((row) => {
    const searchableText = normalizeSearch(
      SEARCH_FIELDS.map((field) => column(row, field)).join(' ')
    );
    const matchesSearch = !query || searchableText.includes(query);
    const matchesFilters = FILTERS.every(([key]) => (
      !selected[key] || values(row, key).some((value) => normalizeSearch(value) === selected[key])
    ));
    return matchesSearch && matchesFilters;
  });

  sortRows();
  render();
}

function sortRows() {
  const [field, direction] = $('sort').value.split('-');
  const key = field === 'name' ? FIELDS.name : FIELDS.university;
  const multiplier = direction === 'desc' ? -1 : 1;

  state.filtered.sort((first, second) => (
    normalizeSearch(column(first, key)).localeCompare(normalizeSearch(column(second, key)), 'es') * multiplier
  ));
}

function render() {
  const cards = $('cards');
  const resultCount = state.filtered.length;

  cards.replaceChildren();
  $('result-count').textContent = `${resultCount} ${resultCount === 1 ? 'resultado' : 'resultados'}`;
  $('download-csv').disabled = resultCount === 0;
  $('status').className = 'status';

  if (resultCount === 0) {
    $('status').textContent = 'No hay iniciativas que coincidan con los criterios seleccionados.';
    return;
  }

  $('status').textContent = '';
  state.filtered.forEach((row) => cards.append(createCard(row)));
}

function createCard(row) {
  const id = display(column(row, FIELDS.id));
  const name = display(column(row, FIELDS.name)) || 'Iniciativa sin nombre';
  const description = display(column(row, FIELDS.description));
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
  university.textContent = display(column(row, FIELDS.university));
  identifier.textContent = id;
  metadata.append(university, identifier);

  title.textContent = name;
  summary.textContent = description.length > 190 ? `${description.slice(0, 187)}…` : description;

  footer.className = 'card-footer';
  tag.className = 'tag';
  tag.textContent = display(column(row, FIELDS.type)) || 'Iniciativa';

  button.className = 'details-link';
  button.type = 'button';
  button.textContent = 'Ver ficha →';
  button.setAttribute('aria-label', `Ver ficha de ${id || 'la iniciativa'}: ${name}`);
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', 'initiative-dialog');
  button.addEventListener('click', () => openDialog(row, button));
  button.addEventListener('keydown', (event) => {
    if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openDialog(row, button);
    }
  });

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

  return document.createTextNode(text);
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

function renderDetailField(row, key, labelText) {
  const value = display(column(row, FIELDS[key]));
  if (!value) return null;

  const item = document.createElement('div');
  const label = document.createElement('dt');
  const content = document.createElement('dd');

  item.className = `detail-item${key === 'description' ? ' full' : ''}`;
  label.textContent = labelText;
  renderFieldValue(content, key, value);
  item.append(label, content);
  return item;
}

function openDialog(row, trigger) {
  const dialog = $('initiative-dialog');
  const content = $('dialog-content');
  const closeButton = $('close-dialog');
  const id = display(column(row, FIELDS.id));
  const name = display(column(row, FIELDS.name)) || 'Iniciativa sin nombre';
  const title = document.createElement('h2');
  const details = document.createElement('dl');

  lastDialogTrigger = trigger;
  title.id = 'dialog-title';
  title.className = 'dialog-title';
  title.textContent = name;
  details.className = 'detail-grid';

  DETAIL_FIELDS.forEach(([key, labelText]) => {
    const field = renderDetailField(row, key, labelText);
    if (field) details.append(field);
  });

  closeButton.setAttribute('aria-label', `Cerrar ficha de ${id || name}`);
  content.replaceChildren(title, details);
  dialog.showModal();
  closeButton.focus({ preventScroll: true });
}

function restoreDialogFocus() {
  const trigger = lastDialogTrigger;
  lastDialogTrigger = null;
  if (trigger?.isConnected && typeof trigger.focus === 'function') {
    trigger.focus({ preventScroll: true });
  }
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
  link.download = 'iniciativas-salud-mental-filtradas.csv';
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

async function init() {
  try {
    const response = await fetch(CSV_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const parsed = parseCSV(await response.text());
    if (parsed.length === 0) throw new Error('El CSV no contiene filas.');

    state.headers = parsed.shift().map(display);
    state.rows = parsed.filter((row) => row.some((value) => display(value)));

    const missing = Object.values(FIELDS).filter((field) => !state.headers.includes(field));
    if (missing.length) throw new Error(`Faltan columnas esperadas: ${missing.join(', ')}`);

    buildFilters();
    applyFilters();
  } catch (error) {
    console.error('No se pudo cargar el CSV:', error);
    $('result-count').textContent = 'No se han podido cargar las iniciativas.';
    $('download-csv').disabled = true;
    $('status').className = 'status error';
    $('status').textContent = 'No se han podido cargar las iniciativas. Comprueba la conexión o la publicación del CSV e inténtalo de nuevo.';
  }
}

$('search').addEventListener('input', applyFilters);
$('sort').addEventListener('change', applyFilters);
$('download-csv').addEventListener('click', downloadCSV);
$('clear-filters').addEventListener('click', () => {
  $('search').value = '';
  $('sort').value = 'name-asc';
  $('filters').querySelectorAll('select').forEach((select) => {
    select.value = '';
  });
  applyFilters();
});
$('close-dialog').addEventListener('click', () => $('initiative-dialog').close());
$('initiative-dialog').addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    $('initiative-dialog').close();
  }
});
$('initiative-dialog').addEventListener('close', restoreDialogFocus);

init();
