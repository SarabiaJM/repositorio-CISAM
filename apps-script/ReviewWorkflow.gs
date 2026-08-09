/**
 * Menú y flujo administrativo de revisión de solicitudes de cambio.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('CISAM')
    .addItem('Aprobar solicitud seleccionada', 'aprobarSolicitudSeleccionada')
    .addItem('Rechazar solicitud seleccionada', 'rechazarSolicitudSeleccionada')
    .addSeparator()
    .addItem('Actualizar selector de iniciativas', 'actualizarSelectorIniciativas')
    .addItem('Comprobar configuración', 'comprobarConfiguracion')
    .addToUi();
}

function aprobarSolicitudSeleccionada() {
  const ui = SpreadsheetApp.getUi();
  const context = cisamSelectedRequest_();
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const requestValues = context.sheet.getRange(context.row, 1, 1, context.sheet.getLastColumn()).getDisplayValues()[0];
    const status = requestValues[context.map.column('Estado de la solicitud') - 1];
    if (status !== CISAM_CFG.VALUES.PENDING) {
      throw new Error('Solo puede aprobarse una solicitud con estado Pendiente. Estado actual: ' + status + '.');
    }

    const requestId = requestValues[context.map.column('ID de solicitud') - 1];
    const cisamId = normalizeCisamHeader_(requestValues[context.map.column('ID CISAM afectado') - 1]).toUpperCase();
    const selectedFields = uniqueCisam_(splitCisamMulti_(requestValues[context.map.column('Campos que desea modificar') - 1]));
    const editableHeaders = CISAM_FIELD_DEFS.map(function (field) { return field.header; });
    const invalidFields = selectedFields.filter(function (field) { return editableHeaders.indexOf(field) === -1; });
    if (!selectedFields.length || invalidFields.length) {
      throw new Error('La lista de campos a modificar está vacía o contiene campos no permitidos: ' + invalidFields.join(', ') + '.');
    }
    const proposals = {};
    const missing = [];
    selectedFields.forEach(function (field) {
      const value = cisamText_(requestValues[context.map.column('Propuesta — ' + field) - 1]);
      proposals[field] = value;
      if (!value.trim()) missing.push(field);
    });
    if (missing.length) {
      throw new Error('No se puede aprobar: faltan propuestas para ' + missing.join(', ') + '. Use [ELIMINAR] para solicitar un valor vacío.');
    }

    const confirmation = ui.alert(
      'Aprobar ' + requestId,
      'Se aplicarán cambios exclusivamente en: ' + selectedFields.join(', ') + '. ¿Continuar?',
      ui.ButtonSet.YES_NO
    );
    if (confirmation !== ui.Button.YES) return;
    const reviewer = cisamReviewer_(ui);
    if (!reviewer) return;
    const notesAnswer = ui.prompt('Observaciones de resolución', 'Añada observaciones opcionales para la aprobación:', ui.ButtonSet.OK_CANCEL);
    if (notesAnswer.getSelectedButton() !== ui.Button.OK) return;
    const resolutionNotes = notesAnswer.getResponseText().trim();

    const spreadsheet = cisamSpreadsheet_();
    const master = spreadsheet.getSheetByName(CISAM_CFG.SHEETS.MASTER);
    const history = spreadsheet.getSheetByName(CISAM_CFG.SHEETS.HISTORY);
    if (!history) throw new Error('No existe la hoja ' + CISAM_CFG.SHEETS.HISTORY + '.');
    const masterMap = cisamHeaderMap_(master, CISAM_CFG.MASTER_HEADERS);
    const historyMap = cisamHeaderMap_(history, CISAM_CFG.HISTORY_HEADERS);
    const masterRow = cisamFindMasterRowById_(master, masterMap, cisamId);
    const masterValues = master.getRange(masterRow, 1, 1, master.getLastColumn()).getDisplayValues()[0];
    const appliedAt = cisamDateText_(new Date());
    const effectiveChanges = [];

    selectedFields.forEach(function (field) {
      const oldValue = cisamText_(masterValues[masterMap.column(field) - 1]);
      const rawProposal = proposals[field].trim();
      const newValue = rawProposal.toUpperCase() === CISAM_CFG.VALUES.DELETE_TOKEN ? '' : proposals[field];
      if (oldValue !== newValue) {
        effectiveChanges.push({ field: field, oldValue: oldValue, newValue: newValue });
      }
    });

    const historyStartRow = cisamNextDataRow_(history, historyMap.column('ID de cambio'));
    const historyIds = cisamNextHistoryIds_(history, historyMap.column('ID de cambio'), effectiveChanges.length);
    cisamEnsureRows_(history, historyStartRow + Math.max(effectiveChanges.length - 1, 0));
    const requests = [];
    effectiveChanges.forEach(function (change) {
      requests.push(cisamUpdateCellRequest_(master.getSheetId(), masterRow, masterMap.column(change.field), change.newValue));
    });
    requests.push(cisamUpdateCellRequest_(master.getSheetId(), masterRow, masterMap.column('Fecha_última_revisión'), appliedAt));

    if (effectiveChanges.length) {
      const historyRows = effectiveChanges.map(function (change, index) {
        return [historyIds[index], requestId, cisamId, appliedAt, reviewer, change.field, change.oldValue, change.newValue];
      });
      historyRows.forEach(function (row, index) {
        requests.push(cisamUpdateRowRequest_(history.getSheetId(), historyStartRow + index, 1, row));
      });
    }

    requests.push(cisamUpdateCellRequest_(context.sheet.getSheetId(), context.row, context.map.column('Estado de la solicitud'), CISAM_CFG.VALUES.APPROVED));
    requests.push(cisamUpdateCellRequest_(context.sheet.getSheetId(), context.row, context.map.column('Validación'), 'Correcta'));
    requests.push(cisamUpdateCellRequest_(context.sheet.getSheetId(), context.row, context.map.column('Fecha de revisión'), appliedAt));
    requests.push(cisamUpdateCellRequest_(context.sheet.getSheetId(), context.row, context.map.column('Revisor'), reviewer));
    requests.push(cisamUpdateCellRequest_(context.sheet.getSheetId(), context.row, context.map.column('Motivo o comentarios de resolución'), resolutionNotes));
    cisamBatchUpdate_(spreadsheet.getId(), requests);

    const selectorRelevant = effectiveChanges.some(function (change) {
      return change.field === 'Nombre de la Actividad / Acción / Iniciativa' || change.field === 'Universidad';
    });
    let selectorMessage = '';
    if (selectorRelevant) {
      try {
        actualizarSelectorIniciativas();
        selectorMessage = ' Selector actualizado.';
      } catch (selectorError) {
        selectorMessage = ' La aprobación es válida, pero el selector no pudo actualizarse; se reintentará con el activador diario. Error: ' + selectorError.message;
      }
    }
    ui.alert('Solicitud ' + requestId + ' aprobada. Se han modificado efectivamente ' + effectiveChanges.length + ' campos.' + selectorMessage);
  } catch (error) {
    ui.alert('No se ha podido aprobar la solicitud', error.message, ui.ButtonSet.OK);
    throw error;
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function rechazarSolicitudSeleccionada() {
  const ui = SpreadsheetApp.getUi();
  const context = cisamSelectedRequest_();
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const values = context.sheet.getRange(context.row, 1, 1, context.sheet.getLastColumn()).getDisplayValues()[0];
    const status = values[context.map.column('Estado de la solicitud') - 1];
    if (status !== CISAM_CFG.VALUES.PENDING) {
      throw new Error('Solo puede rechazarse una solicitud con estado Pendiente. Estado actual: ' + status + '.');
    }
    const requestId = values[context.map.column('ID de solicitud') - 1];
    const reasonAnswer = ui.prompt('Rechazar ' + requestId, 'Indique el motivo obligatorio del rechazo:', ui.ButtonSet.OK_CANCEL);
    if (reasonAnswer.getSelectedButton() !== ui.Button.OK) return;
    const reason = reasonAnswer.getResponseText().trim();
    if (!reason) throw new Error('El motivo de rechazo es obligatorio.');
    const reviewer = cisamReviewer_(ui);
    if (!reviewer) return;
    const reviewedAt = cisamDateText_(new Date());
    const spreadsheet = cisamSpreadsheet_();
    cisamBatchUpdate_(spreadsheet.getId(), [
      cisamUpdateCellRequest_(context.sheet.getSheetId(), context.row, context.map.column('Estado de la solicitud'), CISAM_CFG.VALUES.REJECTED),
      cisamUpdateCellRequest_(context.sheet.getSheetId(), context.row, context.map.column('Fecha de revisión'), reviewedAt),
      cisamUpdateCellRequest_(context.sheet.getSheetId(), context.row, context.map.column('Revisor'), reviewer),
      cisamUpdateCellRequest_(context.sheet.getSheetId(), context.row, context.map.column('Motivo o comentarios de resolución'), reason)
    ]);
    ui.alert('Solicitud ' + requestId + ' rechazada. La iniciativa no se ha modificado.');
  } catch (error) {
    ui.alert('No se ha podido rechazar la solicitud', error.message, ui.ButtonSet.OK);
    throw error;
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function cisamSelectedRequest_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const configuredId = PropertiesService.getScriptProperties().getProperty(CISAM_CFG.PROPERTIES.SPREADSHEET_ID);
  if (!spreadsheet || spreadsheet.getId() !== configuredId) {
    throw new Error('Ejecute esta acción desde el libro configurado para CISAM.');
  }
  const sheet = spreadsheet.getActiveSheet();
  if (!sheet || sheet.getName() !== CISAM_CFG.SHEETS.REQUESTS) {
    throw new Error('Seleccione una fila de la hoja ' + CISAM_CFG.SHEETS.REQUESTS + '.');
  }
  const row = sheet.getActiveRange().getRow();
  if (row < 2) throw new Error('Seleccione una fila de datos, no el encabezado.');
  return { sheet: sheet, row: row, map: cisamHeaderMap_(sheet, cisamRequestHeaders_()) };
}

function cisamReviewer_(ui) {
  const email = Session.getActiveUser().getEmail();
  if (email) return email;
  const answer = ui.prompt('Identificación del revisor', 'Google no facilita su correo. Escriba su nombre completo:', ui.ButtonSet.OK_CANCEL);
  if (answer.getSelectedButton() !== ui.Button.OK) return '';
  const name = answer.getResponseText().trim();
  if (!name) throw new Error('Debe identificarse el revisor.');
  return name;
}

function cisamNextHistoryIds_(history, idColumn, count) {
  if (!count) return [];
  let maximum = 0;
  if (history.getLastRow() > 1) {
    history.getRange(2, idColumn, history.getLastRow() - 1, 1).getDisplayValues().forEach(function (row) {
      const match = normalizeCisamHeader_(row[0]).match(/^HIST-(\d+)$/i);
      if (match) maximum = Math.max(maximum, Number(match[1]));
    });
  }
  return Array.from({ length: count }, function (_, index) {
    return 'HIST-' + String(maximum + index + 1).padStart(6, '0');
  });
}
