/**
 * Auditoría no destructiva de la configuración y de la integridad del libro.
 */

function comprobarConfiguracion() {
  const report = auditarConfiguracionCisam();
  console.log(JSON.stringify(report, null, 2));
  SpreadsheetApp.getUi().alert(
    report.ok ? 'Configuración CISAM correcta' : 'Configuración CISAM con incidencias',
    JSON.stringify(report, null, 2),
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  return report;
}

function auditarConfiguracionCisam() {
  const spreadsheet = cisamSpreadsheet_();
  const issues = [];
  const result = {
    timestamp: cisamDateText_(new Date()),
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    timeZone: spreadsheet.getSpreadsheetTimeZone(),
    sheets: {},
    initiatives: {},
    publication: {},
    form: {},
    triggers: [],
    issues: issues
  };

  if (spreadsheet.getSpreadsheetTimeZone() !== CISAM_CFG.TIME_ZONE) {
    issues.push('La zona horaria del libro no es ' + CISAM_CFG.TIME_ZONE + '.');
  }

  [
    [CISAM_CFG.SHEETS.RESPONSES, null],
    [CISAM_CFG.SHEETS.MASTER, CISAM_CFG.MASTER_HEADERS],
    [CISAM_CFG.SHEETS.PUBLICATION, null],
    [CISAM_CFG.SHEETS.PROCESSING, CISAM_CFG.PROCESSING_HEADERS],
    [CISAM_CFG.SHEETS.REQUESTS, cisamRequestHeaders_()],
    [CISAM_CFG.SHEETS.HISTORY, CISAM_CFG.HISTORY_HEADERS]
  ].forEach(function (entry) {
    const sheet = spreadsheet.getSheetByName(entry[0]);
    result.sheets[entry[0]] = { exists: Boolean(sheet) };
    if (!sheet) {
      issues.push('Falta la hoja ' + entry[0] + '.');
      return;
    }
    result.sheets[entry[0]].lastRow = sheet.getLastRow();
    result.sheets[entry[0]].lastColumn = sheet.getLastColumn();
    if (entry[1]) {
      try {
        cisamHeaderMap_(sheet, entry[1]);
        result.sheets[entry[0]].headersValid = true;
      } catch (error) {
        result.sheets[entry[0]].headersValid = false;
        issues.push(error.message);
      }
    }
  });

  const master = spreadsheet.getSheetByName(CISAM_CFG.SHEETS.MASTER);
  if (master) cisamAuditMaster_(master, result, issues);
  const publication = spreadsheet.getSheetByName(CISAM_CFG.SHEETS.PUBLICATION);
  if (publication && master) cisamAuditPublication_(publication, master, result, issues);
  cisamAuditWrongValue_(spreadsheet, result, issues);

  try {
    cisamAuditForm_(result, issues);
  } catch (error) {
    issues.push('No se ha podido auditar el formulario: ' + error.message);
  }
  cisamAuditTriggers_(result, issues);
  result.ok = issues.length === 0;
  return result;
}

function cisamAuditMaster_(master, result, issues) {
  try {
    const map = cisamHeaderMap_(master, CISAM_CFG.MASTER_HEADERS);
    const rows = master.getLastRow() > 1
      ? master.getRange(2, 1, master.getLastRow() - 1, master.getLastColumn()).getDisplayValues()
      : [];
    const idIndex = map.column('ID') - 1;
    const statusIndex = map.column('Estado') - 1;
    const publishIndex = map.column('Publicar') - 1;
    const ids = rows.map(function (row) { return normalizeCisamHeader_(row[idIndex]).toUpperCase(); }).filter(Boolean);
    const counts = {};
    const duplicates = [];
    const seen = {};
    let maxId = 0;
    const invalid = [];
    ids.forEach(function (id) {
      const match = id.match(/^CISAM-(\d+)$/);
      if (!match) invalid.push(id); else maxId = Math.max(maxId, Number(match[1]));
      if (seen[id]) duplicates.push(id);
      seen[id] = true;
    });
    rows.filter(function (row) { return normalizeCisamHeader_(row[idIndex]); }).forEach(function (row) {
      const key = cisamText_(row[statusIndex]) + ' | ' + cisamText_(row[publishIndex]);
      counts[key] = (counts[key] || 0) + 1;
    });
    result.initiatives = {
      count: ids.length,
      uniqueIds: Object.keys(seen).length,
      duplicateIds: uniqueCisam_(duplicates),
      invalidIds: invalid,
      maximumNumericId: maxId,
      statusPublishCounts: counts,
      publicableCount: rows.filter(function (row) {
        return normalizeCisamHeader_(row[idIndex]) && row[statusIndex] === CISAM_CFG.VALUES.APPROVED && row[publishIndex] === CISAM_CFG.VALUES.YES;
      }).length
    };
    if (duplicates.length) issues.push('Hay ID CISAM duplicados: ' + uniqueCisam_(duplicates).join(', ') + '.');
    if (invalid.length) issues.push('Hay ID CISAM con formato no válido: ' + invalid.join(', ') + '.');

    const validationLastRow = Math.max(master.getLastRow(), 2);
    const validations = master.getRange(2, map.column('Ámbito de Actuación'), validationLastRow - 1, map.column('Espacio de realización') - map.column('Ámbito de Actuación') + 1).getDataValidations();
    result.initiatives.dataValidationsJtoP = validations.reduce(function (total, row) {
      return total + row.filter(Boolean).length;
    }, 0);
  } catch (error) {
    issues.push(error.message);
  }
}

function cisamAuditPublication_(publication, master, result, issues) {
  const formula = publication.getRange('A1').getFormula();
  const normalizedFormula = formula.replace(/\s+/g, '');
  const header = publication.getRange(1, 1, 1, Math.max(publication.getLastColumn(), CISAM_CFG.PUBLIC_HEADERS.length)).getDisplayValues()[0];
  let lastNonEmptyHeader = 0;
  header.forEach(function (value, index) { if (normalizeCisamHeader_(value)) lastNonEmptyHeader = index + 1; });
  const dataRows = Math.max(publication.getLastRow() - 1, 0);
  result.publication = {
    formulaPresent: Boolean(formula),
    exportsThroughColumn: lastNonEmptyHeader,
    expectedPublicColumns: CISAM_CFG.PUBLIC_HEADERS.length,
    dataRows: dataRows,
    requiresApproved: /INICIATIVAS!T2:T="Aprobada"/i.test(normalizedFormula),
    requiresPublishYes: /INICIATIVAS!U2:U="Sí"/i.test(normalizedFormula),
    keepsMultiResponseTransformations: (normalizedFormula.match(/REGEXREPLACE/gi) || []).length >= 3
  };
  if (!result.publication.formulaPresent) issues.push('Publicación!A1 no contiene la fórmula de publicación.');
  if (lastNonEmptyHeader !== CISAM_CFG.PUBLIC_HEADERS.length) issues.push('Publicación no exporta exactamente A:S.');
  if (!result.publication.requiresApproved || !result.publication.requiresPublishYes) issues.push('La fórmula de Publicación no aplica simultáneamente Aprobada + Sí.');
  if (!result.publication.keepsMultiResponseTransformations) issues.push('La fórmula de Publicación no conserva todas las transformaciones multirrespuesta esperadas.');
  if (result.initiatives.publicableCount != null && dataRows !== result.initiatives.publicableCount) {
    issues.push('El número de filas publicadas (' + dataRows + ') no coincide con las iniciativas publicables (' + result.initiatives.publicableCount + ').');
  }
}

function cisamAuditWrongValue_(spreadsheet, result, issues) {
  const wrong = 'No especificado / No aplica / No aplica';
  const locations = [];
  [CISAM_CFG.SHEETS.MASTER, CISAM_CFG.SHEETS.CATALOGS].forEach(function (name) {
    const sheet = spreadsheet.getSheetByName(name);
    if (!sheet || !sheet.getLastRow() || !sheet.getLastColumn()) return;
    const values = sheet.getDataRange().getDisplayValues();
    values.forEach(function (row, rowIndex) {
      row.forEach(function (value, columnIndex) {
        if (cisamText_(value).indexOf(wrong) !== -1) locations.push(name + '!' + cisamColumnLetter_(columnIndex + 1) + (rowIndex + 1));
      });
    });
  });
  result.wrongTripleValueLocations = locations;
  if (locations.length) issues.push('Persiste el valor erróneo triple en: ' + locations.join(', ') + '.');
}

function cisamAuditForm_(result, issues) {
  const form = cisamForm_();
  const items = form.getItems();
  const titles = items.map(function (item) { return normalizeCisamTitle_(item.getTitle()); });
  const requiredTitles = [
    CISAM_CFG.FORM.TYPE,
    CISAM_CFG.FORM.SECTION_NEW,
    CISAM_CFG.FORM.SECTION_CHANGE,
    CISAM_CFG.FORM.SELECT_INITIATIVE,
    CISAM_CFG.FORM.JUSTIFICATION,
    CISAM_CFG.FORM.FIELDS_TO_CHANGE
  ].concat(CISAM_CFG.FORM_SOURCE_ORDER)
    .concat(CISAM_FIELD_DEFS.map(function (field) { return CISAM_CFG.FORM.MOD_PREFIX + field.formTitle; }));
  const duplicates = requiredTitles.filter(function (title) {
    return titles.filter(function (candidate) { return candidate === normalizeCisamTitle_(title); }).length !== 1;
  });
  const typeItem = items.filter(function (item) { return normalizeCisamTitle_(item.getTitle()) === normalizeCisamTitle_(CISAM_CFG.FORM.TYPE); })[0];
  const selectorItem = items.filter(function (item) { return normalizeCisamTitle_(item.getTitle()) === normalizeCisamTitle_(CISAM_CFG.FORM.SELECT_INITIATIVE); })[0];
  const wrongOption = 'No especificado / No aplica / No aplica';
  const wrongOptions = [];
  items.forEach(function (item) {
    cisamFormChoices_(item).forEach(function (choice) {
      if (choice === wrongOption) wrongOptions.push(item.getTitle());
    });
  });
  const selectorChoices = selectorItem ? selectorItem.asListItem().getChoices().map(function (choice) { return choice.getValue(); }) : [];
  result.form = {
    formId: form.getId(),
    itemCount: items.length,
    typeQuestionIsFirst: Boolean(typeItem && typeItem.getIndex() === 0),
    missingOrDuplicatedManagedTitles: duplicates,
    selectorCount: selectorChoices.length,
    wrongTripleOptionQuestions: wrongOptions,
    destinationId: form.getDestinationId() || ''
  };
  if (!result.form.typeQuestionIsFirst) issues.push('Tipo de solicitud no es la primera pregunta.');
  if (duplicates.length) issues.push('Faltan o están duplicados elementos del formulario: ' + duplicates.join(', ') + '.');
  if (wrongOptions.length) issues.push('El valor erróneo triple persiste en opciones del formulario: ' + wrongOptions.join(', ') + '.');
  if (result.initiatives.publicableCount != null && selectorChoices.length !== result.initiatives.publicableCount) {
    issues.push('El selector contiene ' + selectorChoices.length + ' opciones y deberían ser ' + result.initiatives.publicableCount + '.');
  }
}

function cisamFormChoices_(item) {
  switch (item.getType()) {
    case FormApp.ItemType.CHECKBOX: return item.asCheckboxItem().getChoices().map(function (choice) { return choice.getValue(); });
    case FormApp.ItemType.LIST: return item.asListItem().getChoices().map(function (choice) { return choice.getValue(); });
    case FormApp.ItemType.MULTIPLE_CHOICE: return item.asMultipleChoiceItem().getChoices().map(function (choice) { return choice.getValue(); });
    default: return [];
  }
}

function cisamAuditTriggers_(result, issues) {
  const expected = ['procesarEnvioFormulario', 'alEditarIniciativas', 'actualizarSelectorIniciativas'];
  const triggers = ScriptApp.getProjectTriggers();
  result.triggers = triggers.map(function (trigger) {
    let sourceId = '';
    try { sourceId = trigger.getTriggerSourceId() || ''; } catch (error) { sourceId = ''; }
    return {
      handler: trigger.getHandlerFunction(),
      eventType: String(trigger.getEventType()),
      sourceId: sourceId,
      triggerId: trigger.getUniqueId()
    };
  });
  expected.forEach(function (handler) {
    const count = triggers.filter(function (trigger) { return trigger.getHandlerFunction() === handler; }).length;
    if (count !== 1) issues.push('El activador ' + handler + ' aparece ' + count + ' veces; debería aparecer una vez.');
  });
}

function probarIdempotenciaConfiguracion() {
  const form = cisamForm_();
  const spreadsheet = cisamSpreadsheet_();
  configurarPaquete0();
  const first = {
    formItems: form.getItems().length,
    sheets: spreadsheet.getSheets().length,
    triggers: ScriptApp.getProjectTriggers().length
  };
  configurarPaquete0();
  const second = {
    formItems: form.getItems().length,
    sheets: spreadsheet.getSheets().length,
    triggers: ScriptApp.getProjectTriggers().length
  };
  const ok = first.formItems === second.formItems && first.sheets === second.sheets && first.triggers === second.triggers;
  if (!ok) throw new Error('La segunda ejecución ha alterado el número de preguntas, hojas o activadores.');
  return { ok: true, first: first, second: second };
}

function cisamColumnLetter_(column) {
  let result = '';
  let number = column;
  while (number > 0) {
    const remainder = (number - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    number = Math.floor((number - 1) / 26);
  }
  return result;
}
