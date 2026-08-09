/**
 * Inicialización idempotente de hojas, formulario y activadores.
 */

var cisamFormItemCache_ = null;

function inicializarConfiguracionCisam() {
  const ui = SpreadsheetApp.getUi();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Abra el proyecto de Apps Script desde el libro que desea configurar.');

  const currentFormId = PropertiesService.getScriptProperties().getProperty(CISAM_CFG.PROPERTIES.FORM_ID) || '';
  const answer = ui.prompt(
    'Configuración CISAM',
    'Pegue el ID o la URL de edición del formulario que corresponde a este libro:',
    ui.ButtonSet.OK_CANCEL
  );
  if (answer.getSelectedButton() !== ui.Button.OK) return;
  const formId = cisamExtractGoogleId_(answer.getResponseText()) || currentFormId;
  if (!formId) throw new Error('No se ha podido extraer un ID de formulario válido.');

  PropertiesService.getScriptProperties().setProperties({
    CISAM_SPREADSHEET_ID: spreadsheet.getId(),
    CISAM_FORM_ID: formId
  }, false);

  const result = configurarPaquete0();
  ui.alert('Configuración completada', JSON.stringify(result, null, 2), ui.ButtonSet.OK);
}

function configurarPaquete0() {
  const spreadsheet = cisamSpreadsheet_();
  const form = cisamForm_();

  cisamValidateCoreSheets_(spreadsheet);
  cisamEnsureAdministrativeSheets_(spreadsheet);
  cisamConfigureForm_(form);
  actualizarSelectorIniciativas();
  const triggers = cisamInstallTriggers_(spreadsheet, form);

  return {
    spreadsheetId: spreadsheet.getId(),
    formId: form.getId(),
    administrativeSheets: [
      CISAM_CFG.SHEETS.PROCESSING,
      CISAM_CFG.SHEETS.REQUESTS,
      CISAM_CFG.SHEETS.HISTORY
    ],
    triggers: triggers,
    owner: Session.getEffectiveUser().getEmail() || '(Google no facilita el correo)'
  };
}

function vincularFormularioAlLibroConfigurado() {
  const ui = SpreadsheetApp.getUi();
  const spreadsheet = cisamSpreadsheet_();
  const form = cisamForm_();
  const currentDestination = form.getDestinationId();
  if (currentDestination === spreadsheet.getId()) {
    ui.alert('El formulario ya envía sus respuestas al libro configurado.');
    return;
  }
  const confirmation = ui.alert(
    'Vincular formulario',
    'Se cambiará el destino de respuestas del formulario al libro "' + spreadsheet.getName() + '". Esta acción debe usarse en la copia de pruebas antes de enviar respuestas. ¿Continuar?',
    ui.ButtonSet.YES_NO
  );
  if (confirmation !== ui.Button.YES) return;
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
  ui.alert('Formulario vinculado al libro configurado. Google Forms puede crear una nueva pestaña de respuestas; el procesamiento CISAM no depende de su posición.');
}

function cisamExtractGoogleId_(value) {
  const text = String(value || '').trim();
  const match = text.match(/[-\w]{20,}/);
  return match ? match[0] : '';
}

function cisamValidateCoreSheets_(spreadsheet) {
  const required = [CISAM_CFG.SHEETS.RESPONSES, CISAM_CFG.SHEETS.MASTER, CISAM_CFG.SHEETS.PUBLICATION];
  const missing = required.filter(function (name) { return !spreadsheet.getSheetByName(name); });
  if (missing.length) throw new Error('Faltan hojas obligatorias: ' + missing.join(', ') + '.');
  cisamHeaderMap_(spreadsheet.getSheetByName(CISAM_CFG.SHEETS.MASTER), CISAM_CFG.MASTER_HEADERS);
}

function cisamEnsureAdministrativeSheets_(spreadsheet) {
  cisamEnsureSheet_(spreadsheet, CISAM_CFG.SHEETS.PROCESSING, CISAM_CFG.PROCESSING_HEADERS);
  const requests = cisamEnsureSheet_(spreadsheet, CISAM_CFG.SHEETS.REQUESTS, cisamRequestHeaders_());
  cisamEnsureSheet_(spreadsheet, CISAM_CFG.SHEETS.HISTORY, CISAM_CFG.HISTORY_HEADERS);

  const requestMap = cisamHeaderMap_(requests, cisamRequestHeaders_());
  const statusColumn = requestMap.column('Estado de la solicitud');
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList([CISAM_CFG.VALUES.PENDING, CISAM_CFG.VALUES.APPROVED, CISAM_CFG.VALUES.REJECTED], true)
    .setAllowInvalid(false)
    .build();
  requests.getRange(2, statusColumn, Math.max(requests.getMaxRows() - 1, 1), 1).setDataValidation(rule);
  cisamFormatAdministrativeSheets_(spreadsheet);
}

function cisamFormatAdministrativeSheets_(spreadsheet) {
  const profiles = [
    { name: CISAM_CFG.SHEETS.PROCESSING, count: CISAM_CFG.PROCESSING_HEADERS.length, defaultWidth: 160, widths: { 0: 280, 1: 170, 2: 230, 3: 170, 4: 120, 5: 300 } },
    { name: CISAM_CFG.SHEETS.REQUESTS, count: cisamRequestHeaders_().length, defaultWidth: 220, widths: { 0: 130, 1: 260, 2: 170, 3: 230, 4: 120, 5: 360, 6: 320, 7: 320, 26: 130, 27: 300, 28: 170, 29: 220, 30: 320 } },
    { name: CISAM_CFG.SHEETS.HISTORY, count: CISAM_CFG.HISTORY_HEADERS.length, defaultWidth: 180, widths: { 0: 130, 1: 130, 2: 110, 3: 170, 4: 220, 5: 300, 6: 320, 7: 320 } }
  ];
  const requests = [];
  profiles.forEach(function (profile) {
    const sheetId = spreadsheet.getSheetByName(profile.name).getSheetId();
    for (let index = 0; index < profile.count; index += 1) {
      requests.push({
        updateDimensionProperties: {
          range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: index, endIndex: index + 1 },
          properties: { pixelSize: profile.widths[index] || profile.defaultWidth },
          fields: 'pixelSize'
        }
      });
    }
  });
  Sheets.Spreadsheets.batchUpdate({ requests: requests }, spreadsheet.getId());
}

function cisamEnsureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }
  const existingWidth = Math.max(sheet.getLastColumn(), headers.length);
  const existing = sheet.getRange(1, 1, 1, existingWidth).getDisplayValues()[0];
  const hasAnyHeader = existing.some(function (value) { return normalizeCisamHeader_(value); });
  if (!hasAnyHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  cisamHeaderMap_(sheet, headers);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  return sheet;
}

function cisamConfigureForm_(form) {
  cisamFormItemCache_ = form.getItems();
  const sourceItems = {};
  CISAM_CFG.FORM_SOURCE_ORDER.forEach(function (title) {
    sourceItems[title] = cisamFindUniqueFormItemByTitle_(form, title);
  });

  const typeItem = cisamGetOrCreateFormItem_(form, 'TYPE', CISAM_CFG.FORM.TYPE, FormApp.ItemType.MULTIPLE_CHOICE)
    ;
  if (!typeItem.isRequired()) typeItem.setRequired(true);
  const pageNew = cisamGetOrCreateFormItem_(form, 'SECTION_NEW', CISAM_CFG.FORM.SECTION_NEW, FormApp.ItemType.PAGE_BREAK)
    ;
  const pageChange = cisamGetOrCreateFormItem_(form, 'SECTION_CHANGE', CISAM_CFG.FORM.SECTION_CHANGE, FormApp.ItemType.PAGE_BREAK)
    ;
  if (pageChange.getHelpText() !== CISAM_CFG.FORM.CHANGE_INSTRUCTION) {
    pageChange.setHelpText(CISAM_CFG.FORM.CHANGE_INSTRUCTION);
  }
  const selector = cisamGetOrCreateFormItem_(form, 'SELECT_INITIATIVE', CISAM_CFG.FORM.SELECT_INITIATIVE, FormApp.ItemType.LIST)
    ;
  if (!selector.isRequired()) selector.setRequired(true);
  if (!selector.getChoices().length) selector.setChoiceValues(['Selector pendiente de actualización']);
  const justification = cisamGetOrCreateFormItem_(form, 'JUSTIFICATION', CISAM_CFG.FORM.JUSTIFICATION, FormApp.ItemType.PARAGRAPH_TEXT)
    ;
  if (!justification.isRequired()) justification.setRequired(true);
  const fields = cisamGetOrCreateFormItem_(form, 'FIELDS_TO_CHANGE', CISAM_CFG.FORM.FIELDS_TO_CHANGE, FormApp.ItemType.CHECKBOX)
    ;
  const expectedFieldChoices = CISAM_FIELD_DEFS.map(function (field) { return field.header; });
  const currentFieldChoices = fields.getChoices().map(function (choice) { return choice.getValue(); });
  if (JSON.stringify(currentFieldChoices) !== JSON.stringify(expectedFieldChoices)) {
    fields.setChoiceValues(expectedFieldChoices);
  }
  if (!fields.isRequired()) fields.setRequired(true);

  const modItems = CISAM_FIELD_DEFS.map(function (field, index) {
    const itemType = field.longText ? FormApp.ItemType.PARAGRAPH_TEXT : FormApp.ItemType.TEXT;
    const item = cisamGetOrCreateFormItem_(form, 'MOD_' + index, CISAM_CFG.FORM.MOD_PREFIX + field.formTitle, itemType);
    if (field.longText) {
      const paragraph = item;
      if (paragraph.isRequired()) paragraph.setRequired(false);
      if (paragraph.getHelpText() !== CISAM_CFG.FORM.CHANGE_INSTRUCTION) paragraph.setHelpText(CISAM_CFG.FORM.CHANGE_INSTRUCTION);
      return paragraph;
    }
    const text = item;
    if (text.isRequired()) text.setRequired(false);
    if (text.getHelpText() !== CISAM_CFG.FORM.CHANGE_INSTRUCTION) text.setHelpText(CISAM_CFG.FORM.CHANGE_INSTRUCTION);
    return text;
  });

  const ordered = [typeItem, pageNew]
    .concat(CISAM_CFG.FORM_SOURCE_ORDER.map(function (title) { return sourceItems[title]; }))
    .concat([pageChange, selector, justification, fields])
    .concat(modItems);

  const orderedIds = {};
  ordered.forEach(function (item) { orderedIds[String(item.getId())] = true; });
  const unexpected = cisamFormItemCache_.filter(function (item) { return !orderedIds[String(item.getId())]; });
  if (unexpected.length) {
    throw new Error('El formulario contiene elementos no reconocidos y no se reordenará automáticamente: ' + unexpected.map(function (item) { return item.getTitle() || String(item.getType()); }).join(', ') + '.');
  }

  const currentOrder = form.getItems().map(function (item) { return String(item.getId()); });
  ordered.forEach(function (item, index) {
    const desiredId = String(item.getId());
    const currentIndex = currentOrder.indexOf(desiredId);
    if (currentIndex !== index) {
      form.moveItem(currentIndex, index);
      currentOrder.splice(currentIndex, 1);
      currentOrder.splice(index, 0, desiredId);
    }
  });
  pageNew.setGoToPage(FormApp.PageNavigationType.CONTINUE);
  pageChange.setGoToPage(FormApp.PageNavigationType.SUBMIT);
  typeItem.setChoices([
    typeItem.createChoice(CISAM_CFG.VALUES.REQUEST_NEW, pageNew),
    typeItem.createChoice(CISAM_CFG.VALUES.REQUEST_CHANGE, pageChange)
  ]);
}

function cisamFindUniqueFormItemByTitle_(form, title) {
  const expected = normalizeCisamTitle_(title);
  const matches = (cisamFormItemCache_ || form.getItems()).filter(function (item) {
    return normalizeCisamTitle_(item.getTitle()) === expected;
  });
  if (matches.length !== 1) {
    throw new Error('Se esperaba una única pregunta con el título "' + title + '" y se han encontrado ' + matches.length + '.');
  }
  return matches[0];
}

function cisamGetOrCreateFormItem_(form, propertyName, title, itemType) {
  const properties = PropertiesService.getScriptProperties();
  const propertyKey = cisamPropertyKeyForItem_(propertyName);
  const storedId = properties.getProperty(propertyKey);
  let item = null;
  if (storedId) {
    item = (cisamFormItemCache_ || form.getItems()).filter(function (candidate) {
      return String(candidate.getId()) === String(storedId);
    })[0] || null;
  }
  if (!item) {
    const matches = (cisamFormItemCache_ || form.getItems()).filter(function (candidate) {
      return normalizeCisamTitle_(candidate.getTitle()) === normalizeCisamTitle_(title);
    });
    if (matches.length > 1) throw new Error('Hay elementos duplicados con el título gestionado "' + title + '".');
    item = matches[0] || null;
    if (!item) {
      // Si una ejecución anterior fue interrumpida justo después de add*Item(),
      // Google Forms puede conservar una pregunta todavía sin título. La
      // recuperamos y retiramos exclusivamente los duplicados vacíos del mismo
      // tipo para que el siguiente intento siga siendo idempotente.
      const untitled = (cisamFormItemCache_ || form.getItems()).filter(function (candidate) {
        return candidate.getType() === itemType && !normalizeCisamTitle_(candidate.getTitle());
      });
      item = untitled[0] || cisamAddFormItem_(form, itemType);
      if (untitled.length > 1) {
        untitled.slice(1).forEach(function (duplicate) { form.deleteItem(duplicate); });
        const duplicateIds = untitled.slice(1).map(function (duplicate) { return String(duplicate.getId()); });
        cisamFormItemCache_ = cisamFormItemCache_.filter(function (candidate) {
          return duplicateIds.indexOf(String(candidate.getId())) === -1;
        });
      }
      if (cisamFormItemCache_.every(function (candidate) { return String(candidate.getId()) !== String(item.getId()); })) {
        cisamFormItemCache_.push(item);
      }
    }
  }
  if (item.getType() !== itemType) {
    throw new Error('El elemento "' + title + '" existe con un tipo distinto del esperado.');
  }
  cisamSetFormItemTitle_(item, title);
  const itemId = item.getId();
  if (storedId !== String(itemId)) properties.setProperty(propertyKey, String(itemId));

  return cisamCastFormItem_(item, itemType);
}

function cisamCastFormItem_(item, itemType) {
  const methodByType = {};
  methodByType[FormApp.ItemType.MULTIPLE_CHOICE] = 'asMultipleChoiceItem';
  methodByType[FormApp.ItemType.PAGE_BREAK] = 'asPageBreakItem';
  methodByType[FormApp.ItemType.LIST] = 'asListItem';
  methodByType[FormApp.ItemType.PARAGRAPH_TEXT] = 'asParagraphTextItem';
  methodByType[FormApp.ItemType.CHECKBOX] = 'asCheckboxItem';
  methodByType[FormApp.ItemType.TEXT] = 'asTextItem';
  const method = methodByType[itemType];
  return method && typeof item[method] === 'function' ? item[method]() : item;
}

function cisamAddFormItem_(form, itemType) {
  switch (itemType) {
    case FormApp.ItemType.MULTIPLE_CHOICE: return form.addMultipleChoiceItem();
    case FormApp.ItemType.PAGE_BREAK: return form.addPageBreakItem();
    case FormApp.ItemType.LIST: return form.addListItem();
    case FormApp.ItemType.PARAGRAPH_TEXT: return form.addParagraphTextItem();
    case FormApp.ItemType.CHECKBOX: return form.addCheckboxItem();
    case FormApp.ItemType.TEXT: return form.addTextItem();
    default: throw new Error('Tipo de elemento de formulario no compatible: ' + itemType + '.');
  }
}

function cisamSetFormItemTitle_(item, title) {
  if (item.getTitle() === title) return;
  if (typeof item.setTitle === 'function') {
    item.setTitle(title);
    return;
  }
  switch (item.getType()) {
    case FormApp.ItemType.MULTIPLE_CHOICE: item.asMultipleChoiceItem().setTitle(title); break;
    case FormApp.ItemType.PAGE_BREAK: item.asPageBreakItem().setTitle(title); break;
    case FormApp.ItemType.LIST: item.asListItem().setTitle(title); break;
    case FormApp.ItemType.PARAGRAPH_TEXT: item.asParagraphTextItem().setTitle(title); break;
    case FormApp.ItemType.CHECKBOX: item.asCheckboxItem().setTitle(title); break;
    case FormApp.ItemType.TEXT: item.asTextItem().setTitle(title); break;
    default: throw new Error('No se puede asignar título al tipo de elemento: ' + item.getType() + '.');
  }
}

function actualizarSelectorIniciativas() {
  const spreadsheet = cisamSpreadsheet_();
  const master = spreadsheet.getSheetByName(CISAM_CFG.SHEETS.MASTER);
  const map = cisamHeaderMap_(master, CISAM_CFG.MASTER_HEADERS);
  const endColumn = cisamColumnLetter_(master.getLastColumn());
  const rows = (Sheets.Spreadsheets.Values.get(
    spreadsheet.getId(),
    "'" + CISAM_CFG.SHEETS.MASTER.replace(/'/g, "''") + "'!A2:" + endColumn,
    { valueRenderOption: 'FORMATTED_VALUE' }
  ).values || []);
  const indexes = {
    id: map.column('ID') - 1,
    university: map.column('Universidad') - 1,
    name: map.column('Nombre de la Actividad / Acción / Iniciativa') - 1,
    status: map.column('Estado') - 1,
    publish: map.column('Publicar') - 1
  };
  const byId = {};
  rows.forEach(function (row) {
    const id = normalizeCisamHeader_(row[indexes.id]).toUpperCase();
    const idMatch = id.match(/^CISAM-(\d+)$/);
    if (!idMatch || row[indexes.status] !== CISAM_CFG.VALUES.APPROVED || row[indexes.publish] !== CISAM_CFG.VALUES.YES) return;
    if (!byId[id]) {
      byId[id] = {
        id: id,
        number: Number(idMatch[1]),
        label: id + ' — ' + cisamText_(row[indexes.name]) + ' — ' + cisamText_(row[indexes.university])
      };
    }
  });
  const options = Object.keys(byId).map(function (id) { return byId[id]; })
    .sort(function (a, b) { return a.number - b.number; })
    .map(function (entry) { return entry.label; });

  const form = cisamForm_();
  cisamFormItemCache_ = form.getItems();
  const selectorItem = cisamFindUniqueFormItemByTitle_(form, CISAM_CFG.FORM.SELECT_INITIATIVE);
  const selector = typeof selectorItem.asListItem === 'function' ? selectorItem.asListItem() : selectorItem;
  selector.setChoiceValues(options);
  return { count: options.length, options: options };
}

function alEditarIniciativas(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== CISAM_CFG.SHEETS.MASTER) return;
  const map = cisamHeaderMap_(sheet, CISAM_CFG.MASTER_HEADERS);
  const relevant = ['ID', 'Universidad', 'Nombre de la Actividad / Acción / Iniciativa', 'Estado', 'Publicar']
    .map(function (header) { return map.column(header); });
  const first = e.range.getColumn();
  const last = e.range.getLastColumn();
  if (relevant.some(function (column) { return column >= first && column <= last; })) {
    actualizarSelectorIniciativas();
  }
}

function cisamInstallTriggers_(spreadsheet, form) {
  const specs = [
    {
      handler: 'procesarEnvioFormulario',
      sourceId: form.getId(),
      eventType: ScriptApp.EventType.ON_FORM_SUBMIT,
      create: function () { return ScriptApp.newTrigger('procesarEnvioFormulario').forForm(form).onFormSubmit().create(); }
    },
    {
      handler: 'alEditarIniciativas',
      sourceId: spreadsheet.getId(),
      eventType: ScriptApp.EventType.ON_EDIT,
      create: function () { return ScriptApp.newTrigger('alEditarIniciativas').forSpreadsheet(spreadsheet).onEdit().create(); }
    },
    {
      handler: 'actualizarSelectorIniciativas',
      sourceId: '',
      eventType: ScriptApp.EventType.CLOCK,
      create: function () { return ScriptApp.newTrigger('actualizarSelectorIniciativas').timeBased().everyDays(1).atHour(4).create(); }
    }
  ];
  return specs.map(function (spec) {
    const handlerTriggers = ScriptApp.getProjectTriggers().filter(function (trigger) {
      return trigger.getHandlerFunction() === spec.handler;
    });
    const matches = handlerTriggers.filter(function (trigger) {
      if (trigger.getEventType() !== spec.eventType) return false;
      let sourceId = '';
      try { sourceId = trigger.getTriggerSourceId() || ''; } catch (error) { sourceId = ''; }
      return sourceId === spec.sourceId;
    });
    const kept = matches[0] || spec.create();
    handlerTriggers.forEach(function (duplicate) {
      if (duplicate.getUniqueId() !== kept.getUniqueId()) ScriptApp.deleteTrigger(duplicate);
    });
    return { handler: spec.handler, triggerId: kept.getUniqueId(), sourceId: spec.sourceId || 'reloj diario' };
  });
}
