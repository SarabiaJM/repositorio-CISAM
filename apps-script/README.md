# Automatización CISAM — Paquete 0

Código de Google Apps Script para gestionar altas y propuestas de modificación del repositorio CISAM. No modifica la aplicación web pública ni añade columnas auxiliares a `Respuestas de formulario 1`.

## Archivos

- `Config.gs`: nombres canónicos, encabezados, mapeo explícito Forms → `INICIATIVAS` y utilidades de escritura segura.
- `Setup.gs`: configuración idempotente del formulario, hojas administrativas, selector y activadores.
- `FormSubmit.gs`: altas y registro de solicitudes de cambio.
- `ReviewWorkflow.gs`: menú `CISAM`, aprobación, rechazo e historial.
- `Audit.gs`: comprobaciones no destructivas e idempotencia de la configuración.

## Requisitos previos

1. Trabajar primero con copias del formulario y del libro.
2. Abrir la copia del libro y entrar en **Extensiones → Apps Script**.
3. Crear en el proyecto los cinco archivos `.gs` anteriores y copiar su contenido.
4. En **Configuración del proyecto**, establecer la zona horaria `Europe/Madrid`.
5. En **Servicios**, añadir **Google Sheets API**. Si Google lo solicita, habilitar también Google Sheets API en el proyecto de Google Cloud asociado. Este servicio se usa para que las escrituras que afectan a varias hojas se apliquen juntas mediante `spreadsheets.batchUpdate`.

No se necesitan credenciales, claves API, npm ni dependencias de terceros.

## Instalación en la copia de pruebas

1. Ejecute `inicializarConfiguracionCisam` desde Apps Script.
2. Autorice los permisos solicitados.
3. Cuando aparezca el diálogo, pegue la URL de edición de la copia del formulario.
4. Ejecute `vincularFormularioAlLibroConfigurado` **solo después de comprobar que ambos identificadores corresponden a las copias**. Google Forms puede crear una nueva pestaña de respuestas; el procesador utiliza el evento del formulario y no depende de la posición de esa pestaña.
5. Vuelva a ejecutar `configurarPaquete0` si la vinculación ha creado o renombrado pestañas.
6. Recargue el libro para mostrar el menú `CISAM`.
7. Ejecute `probarIdempotenciaConfiguracion` y después `comprobarConfiguracion`.

Los identificadores se guardan en propiedades del script:

- `CISAM_SPREADSHEET_ID`
- `CISAM_FORM_ID`
- identificadores de los elementos gestionados, con prefijo `CISAM_FORM_ITEM_`

## Activadores instalados

`configurarPaquete0` conserva una sola instancia de cada activador:

- `procesarEnvioFormulario`: al enviar el formulario, instalado sobre Google Forms.
- `alEditarIniciativas`: al editar `INICIATIVAS`, instalado sobre Google Sheets.
- `actualizarSelectorIniciativas`: diario, alrededor de las 04:00 en la zona horaria del proyecto.

Todos se ejecutan con la cuenta que ejecuta la configuración. Esa cuenta debe mantener acceso de edición al formulario y al libro.

## Hojas administrativas

### `REGISTRO_PROCESAMIENTO`

1. ID único de respuesta de Google Forms
2. Fecha de procesamiento
3. Tipo de solicitud
4. ID CISAM o ID de solicitud
5. Resultado
6. Mensaje de error

Solo `ALTA_OK` y `CAMBIO_OK` bloquean el reprocesamiento. Una fila `ERROR` conserva el diagnóstico y permite reintentar la respuesta.

### `SOLICITUDES_CAMBIO`

Contiene los ocho campos de identificación y contexto solicitados; después, 18 columnas `Propuesta — …`, una por cada campo público modificable de B:S; y termina con:

1. Estado de la solicitud
2. Validación
3. Fecha de revisión
4. Revisor
5. Motivo o comentarios de resolución

`Validación` señala como `BLOQUEADA` una solicitud con un campo marcado sin propuesta. El flujo de aprobación vuelve a comprobarlo y no depende únicamente de esta marca.

### `HISTORIAL_CAMBIOS`

1. ID de cambio (`HIST-000001`, etc.)
2. ID de solicitud
3. ID CISAM
4. Fecha de aplicación
5. Revisor
6. Campo
7. Valor anterior
8. Valor nuevo

Se registra una fila por campo cuyo valor cambia realmente.

## Flujo de revisión

En `SOLICITUDES_CAMBIO`, seleccione una celda de la fila y use el menú `CISAM`:

- **Aprobar solicitud seleccionada** confirma la operación, identifica al revisor, comprueba propuestas, interpreta `[ELIMINAR]`, actualiza exclusivamente los campos marcados, conserva ID/Estado/Publicar, actualiza `Fecha_última_revisión` y crea el historial.
- **Rechazar solicitud seleccionada** exige motivo e identidad del revisor y no modifica `INICIATIVAS`.

Las escrituras de una aprobación se envían en una única petición atómica a Google Sheets. La actualización posterior del selector pertenece a Google Forms y no puede formar parte de la misma transacción; si falla, el activador diario actúa como respaldo.

## Pruebas obligatorias en las copias

No pruebe altas o modificaciones con el formulario original.

1. **Estado inicial**
   - `comprobarConfiguracion` debe indicar 72 ID únicos, máximo 72, 72 filas publicables y 72 filas en `Publicación`.
   - `Publicación` debe terminar en S y su fórmula debe conservar `Aprobada` + `Sí` y las tres transformaciones multirrespuesta.
2. **Idempotencia de configuración**
   - Ejecute `probarIdempotenciaConfiguracion`.
   - El número de preguntas, hojas y activadores debe ser idéntico en ambas ejecuciones.
3. **Alta**
   - Envíe el formulario publicado de la copia con `Registrar una nueva iniciativa`.
   - Compruebe `CISAM-073`, `Pendiente`, `No`, fecha de alta y tres campos valencianos.
   - Compruebe que no aparece en `Publicación`.
   - Para probar un reintento real, vuelva a invocar manualmente `procesarEnvioFormulario` desde una función temporal que recupere la misma `FormResponse`; no use `FormResponse.submit()`, porque Google no dispara activadores instalables con envíos creados por script. El ID no debe duplicarse.
4. **Modificación**
   - Envíe una solicitud sobre `CISAM-012`.
   - Compruebe que `INICIATIVAS` no cambia y que se crea `CAMBIO-0001` pendiente.
   - Apruebe una solicitud con dos campos, uno con `[ELIMINAR]`; verifique solo esos campos, fecha e historial.
   - Intente aprobarla otra vez: debe bloquearse.
   - Rechace otra solicitud y verifique que la iniciativa permanece intacta.
5. **Selector**
   - Compare su número de opciones con las filas `Aprobada` + `Sí`.
   - Cambie nombre o universidad en una solicitud de prueba, apruébela y compruebe el texto del desplegable.

Registre evidencia de cada prueba antes de configurar el proyecto de producción.

## Paso a producción

Después de superar todas las pruebas:

1. Abra Apps Script desde el libro original.
2. Copie los mismos cinco archivos.
3. Habilite Google Sheets API.
4. Ejecute `inicializarConfiguracionCisam` y pegue la URL del formulario original.
5. **No ejecute `vincularFormularioAlLibroConfigurado` si el formulario original ya está vinculado al libro correcto.**
6. Ejecute `comprobarConfiguracion` antes de aceptar respuestas.
7. Confirme en Apps Script → Activadores que la cuenta propietaria y los tres activadores son los esperados.

## Limitaciones conocidas

- Los activadores instalables siempre se ejecutan como la cuenta que los creó; otra cuenta no puede ver ni administrar esos activadores.
- Google puede no facilitar el correo del revisor. En ese caso, el menú solicita un nombre obligatorio.
- Los cambios realizados por API o por Apps Script no disparan `onEdit`; por eso la aprobación sincroniza directamente el selector y existe un respaldo diario.
- Google Forms y Google Sheets no comparten una transacción. Las filas de Sheets se actualizan atómicamente; la sincronización del selector se ejecuta inmediatamente después y se reintenta diariamente si falla.
- `FormResponse.submit()` no activa un activador instalable de envío. Las pruebas integrales deben hacerse desde el formulario publicado de la copia.
- Al cambiar el destino de respuestas de una copia del formulario, Google puede crear otra pestaña de respuestas. No añada columnas auxiliares a ninguna pestaña de respuestas.

