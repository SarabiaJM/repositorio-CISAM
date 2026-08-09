/**
 * Configuración canónica del paquete 0 del repositorio CISAM.
 *
 * Los identificadores concretos del libro y del formulario se guardan en
 * PropertiesService mediante inicializarConfiguracionCisam(). No hay
 * credenciales en el código.
 */
const CISAM_CFG = Object.freeze({
  TIME_ZONE: 'Europe/Madrid',
  SHEETS: Object.freeze({
    RESPONSES: 'Respuestas de formulario 1',
    MASTER: 'INICIATIVAS',
    PUBLICATION: 'Publicación',
    CATALOGS: 'Catálogos',
    PROCESSING: 'REGISTRO_PROCESAMIENTO',
    REQUESTS: 'SOLICITUDES_CAMBIO',
    HISTORY: 'HISTORIAL_CAMBIOS'
  }),
  PROPERTIES: Object.freeze({
    SPREADSHEET_ID: 'CISAM_SPREADSHEET_ID',
    FORM_ID: 'CISAM_FORM_ID',
    ITEM_PREFIX: 'CISAM_FORM_ITEM_'
  }),
  VALUES: Object.freeze({
    REQUEST_NEW: 'Registrar una nueva iniciativa',
    REQUEST_CHANGE: 'Proponer cambios en una iniciativa existente',
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
    YES: 'Sí',
    NO: 'No',
    DELETE_TOKEN: '[ELIMINAR]',
    NEW_OK: 'ALTA_OK',
    CHANGE_OK: 'CAMBIO_OK',
    ERROR: 'ERROR'
  }),
  MASTER_HEADERS: Object.freeze([
    'ID',
    'Universidad',
    'Vicerrectorado/Unidad Funcional Dependiente',
    'Denominación Unidad Técnica, Gestora o Administrativa',
    'Correo electrónico de contacto',
    'Teléfono de contacto',
    'Nombre de la Actividad / Acción / Iniciativa',
    'Descripción de la Actividad / Acción / Iniciativa (máx. 250 palabras)',
    'Dirección Web / URL Específica',
    'Ámbito de Actuación',
    'Tipo de Actividad',
    'Temporalidad',
    'Financiación',
    'Coste de la actuación',
    'Población destinataria',
    'Espacio de realización',
    "Nom de l'activitat / acció / iniciativa [VA]",
    "Descripció de l'Activitat / Acció / Iniciativa [VA]",
    'Adreça web / URL específica [VA]',
    'Estado',
    'Publicar',
    'Fecha_alta',
    'Fecha_última_revisión',
    'Responsable_revisión',
    'Observaciones_revisión'
  ]),
  PUBLIC_HEADERS: Object.freeze([
    'ID',
    'Universidad',
    'Vicerrectorado/Unidad Funcional Dependiente',
    'Denominación Unidad Técnica, Gestora o Administrativa',
    'Correo electrónico de contacto',
    'Teléfono de contacto',
    'Nombre de la Actividad / Acción / Iniciativa',
    'Descripción de la Actividad / Acción / Iniciativa (máx. 250 palabras)',
    'Dirección Web / URL Específica',
    'Ámbito de Actuación',
    'Tipo de Actividad',
    'Temporalidad',
    'Financiación',
    'Coste de la actuación',
    'Población destinataria',
    'Espacio de realización',
    "Nom de l'activitat / acció / iniciativa [VA]",
    "Descripció de l'Activitat / Acció / Iniciativa [VA]",
    'Adreça web / URL específica [VA]'
  ]),
  ADMIN_HEADERS: Object.freeze({
    ID: 'ID',
    STATUS: 'Estado',
    PUBLISH: 'Publicar',
    CREATED_AT: 'Fecha_alta',
    REVIEWED_AT: 'Fecha_última_revisión',
    REVIEWER: 'Responsable_revisión',
    INTERNAL_NOTES: 'Observaciones_revisión'
  }),
  PROCESSING_HEADERS: Object.freeze([
    'ID único de respuesta de Google Forms',
    'Fecha de procesamiento',
    'Tipo de solicitud',
    'ID CISAM o ID de solicitud',
    'Resultado',
    'Mensaje de error'
  ]),
  REQUEST_BASE_HEADERS: Object.freeze([
    'ID de solicitud',
    'ID único de respuesta',
    'Fecha de solicitud',
    'Correo de la persona solicitante',
    'ID CISAM afectado',
    'Identificación completa de la iniciativa seleccionada',
    'Justificación',
    'Campos que desea modificar'
  ]),
  REQUEST_END_HEADERS: Object.freeze([
    'Estado de la solicitud',
    'Validación',
    'Fecha de revisión',
    'Revisor',
    'Motivo o comentarios de resolución'
  ]),
  HISTORY_HEADERS: Object.freeze([
    'ID de cambio',
    'ID de solicitud',
    'ID CISAM',
    'Fecha de aplicación',
    'Revisor',
    'Campo',
    'Valor anterior',
    'Valor nuevo'
  ]),
  FORM: Object.freeze({
    TYPE: 'Tipo de solicitud',
    SECTION_NEW: 'Sección A — Nueva iniciativa',
    SECTION_CHANGE: 'Sección B — Modificación',
    SELECT_INITIATIVE: 'Iniciativa que desea modificar',
    JUSTIFICATION: 'Resumen o justificación de los cambios',
    FIELDS_TO_CHANGE: 'Campos que desea modificar',
    MOD_PREFIX: 'MOD — ',
    CHANGE_INSTRUCTION: 'Cumplimente únicamente los campos que desea modificar. Un campo vacío conservará su valor actual. Para eliminar expresamente el contenido de un campo, escriba [ELIMINAR].'
  }),
  FORM_SOURCE_ORDER: Object.freeze([
    'Universidad',
    'Vicerrectorado/Unidad Funcional Dependiente',
    'Denominación Unidad Técnica, Gestora o Administrativa',
    'Correo electrónico de contacto',
    'Teléfono de contacto',
    'Nombre de la Actividad / Acción / Iniciativa (en Formato Título: e.g., "Programa Integral para la Prevención de la Conducta Suicida")',
    "Nom de l'activitat / acció / iniciativa [VA]",
    'Descripción de la Actividad / Acción / Iniciativa (máx. 250 palabras)',
    "Descripció de l'Activitat / Acció / Iniciativa [VA]",
    'Dirección Web / URL Específica (poner N/A en caso de no aplicar)',
    'Adreça web / URL específica [VA] (si és el mateix, torneu-ho a posar aquí)',
    'Ámbito de Actuación (Marcar un máximo de 2 en caso de solapamiento)',
    'Tipo de Actividad',
    'Temporalidad',
    'Financiación',
    'Coste de la actuación',
    'Población destinataria (puedes marcar varias opciones)',
    'Espacio de realización'
  ])
});

const CISAM_FIELD_DEFS = Object.freeze([
  { header: 'Universidad', formTitle: 'Universidad', longText: false },
  { header: 'Vicerrectorado/Unidad Funcional Dependiente', formTitle: 'Vicerrectorado/Unidad Funcional Dependiente', longText: false },
  { header: 'Denominación Unidad Técnica, Gestora o Administrativa', formTitle: 'Denominación Unidad Técnica, Gestora o Administrativa', longText: false },
  { header: 'Correo electrónico de contacto', formTitle: 'Correo electrónico de contacto', longText: false },
  { header: 'Teléfono de contacto', formTitle: 'Teléfono de contacto', longText: false },
  { header: 'Nombre de la Actividad / Acción / Iniciativa', formTitle: 'Nombre de la Actividad / Acción / Iniciativa (en Formato Título: e.g., "Programa Integral para la Prevención de la Conducta Suicida")', longText: false },
  { header: 'Descripción de la Actividad / Acción / Iniciativa (máx. 250 palabras)', formTitle: 'Descripción de la Actividad / Acción / Iniciativa (máx. 250 palabras)', longText: true },
  { header: 'Dirección Web / URL Específica', formTitle: 'Dirección Web / URL Específica (poner N/A en caso de no aplicar)', longText: false },
  { header: 'Ámbito de Actuación', formTitle: 'Ámbito de Actuación (Marcar un máximo de 2 en caso de solapamiento)', longText: false },
  { header: 'Tipo de Actividad', formTitle: 'Tipo de Actividad', longText: false },
  { header: 'Temporalidad', formTitle: 'Temporalidad', longText: false },
  { header: 'Financiación', formTitle: 'Financiación', longText: false },
  { header: 'Coste de la actuación', formTitle: 'Coste de la actuación', longText: false },
  { header: 'Población destinataria', formTitle: 'Población destinataria (puedes marcar varias opciones)', longText: false },
  { header: 'Espacio de realización', formTitle: 'Espacio de realización', longText: false },
  { header: "Nom de l'activitat / acció / iniciativa [VA]", formTitle: "Nom de l'activitat / acció / iniciativa [VA]", longText: false },
  { header: "Descripció de l'Activitat / Acció / Iniciativa [VA]", formTitle: "Descripció de l'Activitat / Acció / Iniciativa [VA]", longText: true },
  { header: 'Adreça web / URL específica [VA]', formTitle: 'Adreça web / URL específica [VA] (si és el mateix, torneu-ho a posar aquí)', longText: false }
]);

function cisamRequestHeaders_() {
  return CISAM_CFG.REQUEST_BASE_HEADERS
    .concat(CISAM_FIELD_DEFS.map(function (field) { return 'Propuesta — ' + field.header; }))
    .concat(CISAM_CFG.REQUEST_END_HEADERS);
}

function cisamPropertyKeyForItem_(name) {
  return CISAM_CFG.PROPERTIES.ITEM_PREFIX + String(name).replace(/[^A-Za-z0-9]+/g, '_').toUpperCase();
}

function normalizeCisamHeader_(value) {
  return String(value == null ? '' : value).trim().replace(/\s+/g, ' ');
}

function normalizeCisamTitle_(value) {
  return normalizeCisamHeader_(value);
}

function cisamText_(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(cisamText_).join(' | ');
  return String(value).replace(/\u0000/g, '');
}

function cisamDateText_(date) {
  return Utilities.formatDate(date instanceof Date ? date : new Date(date), CISAM_CFG.TIME_ZONE, 'yyyy-MM-dd HH:mm:ss');
}

function splitCisamMulti_(value) {
  if (Array.isArray(value)) return value.map(cisamText_).map(function (v) { return v.trim(); }).filter(Boolean);
  return cisamText_(value).split(/\s*\|\s*/).map(function (v) { return v.trim(); }).filter(Boolean);
}

function uniqueCisam_(values) {
  const seen = {};
  return values.filter(function (value) {
    const key = normalizeCisamHeader_(value);
    if (!key || seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

function cisamSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty(CISAM_CFG.PROPERTIES.SPREADSHEET_ID);
  if (id) return SpreadsheetApp.openById(id);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) throw new Error('No se ha configurado el ID del libro CISAM. Ejecute inicializarConfiguracionCisam().');
  return active;
}

function cisamForm_() {
  const id = PropertiesService.getScriptProperties().getProperty(CISAM_CFG.PROPERTIES.FORM_ID);
  if (!id) throw new Error('No se ha configurado el ID del formulario CISAM. Ejecute inicializarConfiguracionCisam().');
  return FormApp.openById(id);
}

function cisamHeaderMap_(sheet, requiredHeaders) {
  const width = Math.max(sheet.getLastColumn(), requiredHeaders.length);
  const raw = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  const columns = {};
  const duplicates = [];
  raw.forEach(function (header, index) {
    const key = normalizeCisamHeader_(header);
    if (!key) return;
    if (columns[key]) duplicates.push(key);
    columns[key] = index + 1;
  });
  const missing = requiredHeaders.filter(function (header) { return !columns[normalizeCisamHeader_(header)]; });
  if (duplicates.length || missing.length) {
    throw new Error('Encabezados no válidos en "' + sheet.getName() + '". Faltan: ' + (missing.join(', ') || 'ninguno') + '. Duplicados: ' + (duplicates.join(', ') || 'ninguno') + '.');
  }
  return {
    headers: raw,
    column: function (header) { return columns[normalizeCisamHeader_(header)]; }
  };
}

function cisamNextDataRow_(sheet, keyColumn) {
  const last = Math.max(sheet.getLastRow(), 1);
  if (last < 2) return 2;
  const values = sheet.getRange(2, keyColumn, last - 1, 1).getDisplayValues();
  let lastNonEmpty = 0;
  values.forEach(function (row, index) {
    if (normalizeCisamHeader_(row[0])) lastNonEmpty = index + 1;
  });
  return lastNonEmpty + 2;
}

function cisamCellData_(value) {
  return { userEnteredValue: { stringValue: cisamText_(value) } };
}

function cisamUpdateRowRequest_(sheetId, rowNumber, startColumn, values) {
  return {
    updateCells: {
      range: {
        sheetId: sheetId,
        startRowIndex: rowNumber - 1,
        endRowIndex: rowNumber,
        startColumnIndex: startColumn - 1,
        endColumnIndex: startColumn - 1 + values.length
      },
      rows: [{ values: values.map(cisamCellData_) }],
      fields: 'userEnteredValue'
    }
  };
}

function cisamUpdateCellRequest_(sheetId, rowNumber, columnNumber, value) {
  return cisamUpdateRowRequest_(sheetId, rowNumber, columnNumber, [value]);
}

function cisamBatchUpdate_(spreadsheetId, requests) {
  if (typeof Sheets === 'undefined' || !Sheets.Spreadsheets) {
    throw new Error('Debe habilitarse el servicio avanzado Google Sheets API en el proyecto de Apps Script.');
  }
  if (!requests.length) return;
  Sheets.Spreadsheets.batchUpdate({ requests: requests }, spreadsheetId);
}

function cisamEnsureRows_(sheet, requiredLastRow) {
  if (requiredLastRow > sheet.getMaxRows()) {
    sheet.insertRowsAfter(sheet.getMaxRows(), requiredLastRow - sheet.getMaxRows());
  }
}

