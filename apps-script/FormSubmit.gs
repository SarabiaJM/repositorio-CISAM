/**
 * Procesamiento de respuestas de Google Forms.
 * El activador debe instalarse sobre el formulario, no sobre la hoja de
 * respuestas, para disponer de FormResponse.getId().
 */

function procesarEnvioFormulario(e) {
  let responseId = '';
  let requestType = '';
  let lock = null;
  try {
    if (!e || !e.response) throw new Error('El evento no contiene una respuesta de Google Forms.');
    const response = e.response;
    responseId = cisamText_(response.getId()).trim();
    if (!responseId) throw new Error('Google Forms no ha facilitado un ID único de respuesta.');
    const answers = cisamFormAnswers_(response);
    requestType = cisamAnswer_(answers, CISAM_CFG.FORM.TYPE);
    if ([CISAM_CFG.VALUES.REQUEST_NEW, CISAM_CFG.VALUES.REQUEST_CHANGE].indexOf(requestType) === -1) {
      throw new Error('Tipo de solicitud no reconocido: "' + requestType + '".');
    }

    if (cisamWasProcessed_(responseId)) return;
    lock = LockService.getScriptLock();
    lock.waitLock(30000);
    if (cisamWasProcessed_(responseId)) return;

    if (requestType === CISAM_CFG.VALUES.REQUEST_NEW) {
      cisamProcessNewInitiative_(response, answers, responseId);
    } else {
      cisamProcessChangeRequest_(response, answers, responseId);
    }
  } catch (error) {
    try {
      if (responseId && !cisamWasProcessed_(responseId)) {
        cisamRegisterProcessingError_(responseId, requestType, error);
      }
    } catch (loggingError) {
      console.error('No se pudo registrar el error de procesamiento: ' + loggingError.message);
    }
    throw error;
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function cisamFormAnswers_(formResponse) {
  const result = {};
  formResponse.getItemResponses().forEach(function (itemResponse) {
    const title = normalizeCisamTitle_(itemResponse.getItem().getTitle());
    result[title] = itemResponse.getResponse();
  });
  return result;
}

function cisamAnswer_(answers, title) {
  return cisamText_(answers[normalizeCisamTitle_(title)]).trim();
}

function cisamRawAnswer_(answers, title) {
  return answers[normalizeCisamTitle_(title)];
}

function cisamWasProcessed_(responseId) {
  const spreadsheet = cisamSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(CISAM_CFG.SHEETS.PROCESSING);
  if (!sheet) return false;
  const map = cisamHeaderMap_(sheet, CISAM_CFG.PROCESSING_HEADERS);
  if (sheet.getLastRow() < 2) return false;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
  const idIndex = map.column('ID único de respuesta de Google Forms') - 1;
  const resultIndex = map.column('Resultado') - 1;
  return values.some(function (row) {
    return row[idIndex] === responseId && [CISAM_CFG.VALUES.NEW_OK, CISAM_CFG.VALUES.CHANGE_OK].indexOf(row[resultIndex]) !== -1;
  });
}

function cisamProcessNewInitiative_(response, answers, responseId) {
  const spreadsheet = cisamSpreadsheet_();
  const master = spreadsheet.getSheetByName(CISAM_CFG.SHEETS.MASTER);
  const registry = spreadsheet.getSheetByName(CISAM_CFG.SHEETS.PROCESSING);
  if (!registry) throw new Error('No existe la hoja ' + CISAM_CFG.SHEETS.PROCESSING + '.');
  const masterMap = cisamHeaderMap_(master, CISAM_CFG.MASTER_HEADERS);
  cisamHeaderMap_(registry, CISAM_CFG.PROCESSING_HEADERS);

  const newId = cisamNextSequentialId_(master, masterMap.column('ID'), /^CISAM-(\d+)$/i, 'CISAM-', 3);
  const masterRowNumber = cisamNextDataRow_(master, masterMap.column('ID'));
  const registryRowNumber = cisamNextDataRow_(registry, 1);
  cisamEnsureRows_(master, masterRowNumber);
  cisamEnsureRows_(registry, registryRowNumber);

  const row = new Array(CISAM_CFG.MASTER_HEADERS.length).fill('');
  row[masterMap.column('ID') - 1] = newId;
  CISAM_FIELD_DEFS.forEach(function (field) {
    row[masterMap.column(field.header) - 1] = cisamText_(cisamRawAnswer_(answers, field.formTitle));
  });
  row[masterMap.column('Estado') - 1] = CISAM_CFG.VALUES.PENDING;
  row[masterMap.column('Publicar') - 1] = CISAM_CFG.VALUES.NO;
  row[masterMap.column('Fecha_alta') - 1] = cisamDateText_(response.getTimestamp());

  const registryRow = [
    responseId,
    cisamDateText_(new Date()),
    CISAM_CFG.VALUES.REQUEST_NEW,
    newId,
    CISAM_CFG.VALUES.NEW_OK,
    ''
  ];
  cisamBatchUpdate_(spreadsheet.getId(), [
    cisamUpdateRowRequest_(master.getSheetId(), masterRowNumber, 1, row),
    cisamUpdateRowRequest_(registry.getSheetId(), registryRowNumber, 1, registryRow)
  ]);
}

function cisamProcessChangeRequest_(response, answers, responseId) {
  const spreadsheet = cisamSpreadsheet_();
  const master = spreadsheet.getSheetByName(CISAM_CFG.SHEETS.MASTER);
  const requests = spreadsheet.getSheetByName(CISAM_CFG.SHEETS.REQUESTS);
  const registry = spreadsheet.getSheetByName(CISAM_CFG.SHEETS.PROCESSING);
  if (!requests || !registry) throw new Error('No están creadas las hojas administrativas de solicitudes y procesamiento.');
  const masterMap = cisamHeaderMap_(master, CISAM_CFG.MASTER_HEADERS);
  const requestHeaders = cisamRequestHeaders_();
  const requestMap = cisamHeaderMap_(requests, requestHeaders);
  cisamHeaderMap_(registry, CISAM_CFG.PROCESSING_HEADERS);

  const selectedInitiative = cisamAnswer_(answers, CISAM_CFG.FORM.SELECT_INITIATIVE);
  const idMatch = selectedInitiative.match(/\b(CISAM-\d+)\b/i);
  if (!idMatch) throw new Error('No se ha podido extraer el ID CISAM de la iniciativa seleccionada.');
  const cisamId = idMatch[1].toUpperCase();
  cisamFindMasterRowById_(master, masterMap, cisamId);

  const selectedFields = uniqueCisam_(splitCisamMulti_(cisamRawAnswer_(answers, CISAM_CFG.FORM.FIELDS_TO_CHANGE)));
  if (!selectedFields.length) throw new Error('La solicitud no incluye campos para modificar.');
  const editableHeaders = CISAM_FIELD_DEFS.map(function (field) { return field.header; });
  const invalidFields = selectedFields.filter(function (field) { return editableHeaders.indexOf(field) === -1; });
  if (invalidFields.length) throw new Error('La solicitud incluye campos no modificables: ' + invalidFields.join(', ') + '.');

  const proposalByHeader = {};
  CISAM_FIELD_DEFS.forEach(function (field) {
    proposalByHeader[field.header] = cisamText_(cisamRawAnswer_(answers, CISAM_CFG.FORM.MOD_PREFIX + field.formTitle));
  });
  const missingProposals = selectedFields.filter(function (field) {
    return !proposalByHeader[field].trim();
  });
  const validation = missingProposals.length
    ? 'BLOQUEADA: faltan propuestas para ' + missingProposals.join(' | ')
    : 'Correcta';

  const requestId = cisamNextSequentialId_(requests, requestMap.column('ID de solicitud'), /^CAMBIO-(\d+)$/i, 'CAMBIO-', 4);
  const requestRowNumber = cisamNextDataRow_(requests, requestMap.column('ID de solicitud'));
  const registryRowNumber = cisamNextDataRow_(registry, 1);
  cisamEnsureRows_(requests, requestRowNumber);
  cisamEnsureRows_(registry, registryRowNumber);

  let respondentEmail = '';
  try { respondentEmail = cisamText_(response.getRespondentEmail()); } catch (error) { respondentEmail = ''; }
  const row = new Array(requestHeaders.length).fill('');
  row[requestMap.column('ID de solicitud') - 1] = requestId;
  row[requestMap.column('ID único de respuesta') - 1] = responseId;
  row[requestMap.column('Fecha de solicitud') - 1] = cisamDateText_(response.getTimestamp());
  row[requestMap.column('Correo de la persona solicitante') - 1] = respondentEmail;
  row[requestMap.column('ID CISAM afectado') - 1] = cisamId;
  row[requestMap.column('Identificación completa de la iniciativa seleccionada') - 1] = selectedInitiative;
  row[requestMap.column('Justificación') - 1] = cisamAnswer_(answers, CISAM_CFG.FORM.JUSTIFICATION);
  row[requestMap.column('Campos que desea modificar') - 1] = selectedFields.join(' | ');
  CISAM_FIELD_DEFS.forEach(function (field) {
    row[requestMap.column('Propuesta — ' + field.header) - 1] = proposalByHeader[field.header];
  });
  row[requestMap.column('Estado de la solicitud') - 1] = CISAM_CFG.VALUES.PENDING;
  row[requestMap.column('Validación') - 1] = validation;

  const registryRow = [
    responseId,
    cisamDateText_(new Date()),
    CISAM_CFG.VALUES.REQUEST_CHANGE,
    requestId,
    CISAM_CFG.VALUES.CHANGE_OK,
    ''
  ];
  cisamBatchUpdate_(spreadsheet.getId(), [
    cisamUpdateRowRequest_(requests.getSheetId(), requestRowNumber, 1, row),
    cisamUpdateRowRequest_(registry.getSheetId(), registryRowNumber, 1, registryRow)
  ]);
}

function cisamNextSequentialId_(sheet, idColumn, pattern, prefix, minimumDigits) {
  if (sheet.getLastRow() < 2) return prefix + String(1).padStart(minimumDigits, '0');
  const values = sheet.getRange(2, idColumn, sheet.getLastRow() - 1, 1).getDisplayValues();
  let maximum = 0;
  values.forEach(function (row) {
    const match = normalizeCisamHeader_(row[0]).match(pattern);
    if (match) maximum = Math.max(maximum, Number(match[1]));
  });
  const next = maximum + 1;
  return prefix + String(next).padStart(minimumDigits, '0');
}

function cisamFindMasterRowById_(master, masterMap, cisamId) {
  const idColumn = masterMap.column('ID');
  if (master.getLastRow() < 2) throw new Error('No hay iniciativas en la hoja maestra.');
  const values = master.getRange(2, idColumn, master.getLastRow() - 1, 1).getDisplayValues();
  const matches = [];
  values.forEach(function (row, index) {
    if (normalizeCisamHeader_(row[0]).toUpperCase() === cisamId) matches.push(index + 2);
  });
  if (matches.length !== 1) throw new Error('El ID ' + cisamId + ' debe existir una sola vez y se ha encontrado ' + matches.length + ' veces.');
  return matches[0];
}

function cisamRegisterProcessingError_(responseId, requestType, error) {
  const spreadsheet = cisamSpreadsheet_();
  const registry = spreadsheet.getSheetByName(CISAM_CFG.SHEETS.PROCESSING);
  if (!registry) throw new Error('No existe la hoja de registro de procesamiento.');
  cisamHeaderMap_(registry, CISAM_CFG.PROCESSING_HEADERS);
  const rowNumber = cisamNextDataRow_(registry, 1);
  cisamEnsureRows_(registry, rowNumber);
  const values = [[
    responseId,
    cisamDateText_(new Date()),
    requestType,
    '',
    CISAM_CFG.VALUES.ERROR,
    cisamText_(error && error.message ? error.message : error)
  ]].map(function (row) {
    return row.map(function (value) {
      const text = cisamText_(value);
      return /^[=+\-@]/.test(text) ? "'" + text : text;
    });
  });
  const range = registry.getRange(rowNumber, 1, 1, values[0].length);
  range.setNumberFormat('@');
  range.setValues(values);
}

