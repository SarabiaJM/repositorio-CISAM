# Repositorio de Iniciativas en Salud Mental de las Universidades Valencianas

Aplicación web pública para consultar iniciativas de bienestar emocional y salud mental promovidas por las universidades valencianas. Está dirigida a comunidad universitaria, personal técnico, responsables institucionales y ciudadanía interesada en localizar recursos y actuaciones publicables.

La aplicación es un sitio estático de solo lectura desarrollado con HTML, CSS y JavaScript nativos. No utiliza backend propio, base de datos, frameworks, npm ni proceso de compilación. La información mostrada tiene carácter público y procede de un CSV publicado desde Google Sheets.

## Funciones

- Búsqueda simultánea en contenido castellano y valenciano por ID, nombre, descripción, universidad, unidad funcional y unidad técnica.
- Siete filtros combinables: universidad, ámbito, tipo de actividad, temporalidad, financiación, población destinataria y espacio.
- Ordenación por nombre o universidad, en sentido ascendente o descendente.
- Interfaz en castellano y valenciano.
- Fichas ampliadas con contactos y enlaces validados.
- Estado funcional compartible mediante parámetros de consulta.
- Enlaces directos a una iniciativa mediante su ID.
- Integración con Atrás y Adelante del navegador.
- Copia del enlace de la vista o de una ficha.
- Carga progresiva de tarjetas en lotes de 12.
- Descarga en CSV de todos los resultados filtrados, aunque todavía no se hayan mostrado todas sus tarjetas.

## Arquitectura y estructura

- `index.html`: estructura semántica de la interfaz, cabecera institucional, controles, diálogo y pie.
- `styles.css`: diseño institucional, estados de foco, contraste y adaptación a móvil y escritorio.
- `app.js`: carga y análisis del CSV, traducciones, búsqueda, filtros, ordenación, URL, historial, renderizado seguro, contactos, carga progresiva y exportación.
- `assets/`: logotipo institucional y logotipos de las universidades participantes.
- `apps-script/`: copia versionada de la automatización administrativa de Google Forms y Google Sheets. No se ejecuta en el navegador público.
- Google Sheets: entorno de mantenimiento, revisión y publicación de las iniciativas.
- CSV publicado: vista pública de intercambio que consume la aplicación.

Conviene distinguir cuatro elementos:

1. **Hoja de cálculo de mantenimiento:** contiene el flujo administrativo y los datos de trabajo.
2. **CSV publicado:** contiene únicamente las 19 columnas públicas que se exponen a la aplicación.
3. **Aplicación web:** descarga el CSV una vez, lo conserva en memoria durante la sesión y permite consultarlo. El CSV no funciona como una base de datos editable desde la web.
4. **CSV descargado por el usuario:** exportación nueva de la vista completa o filtrada en ese momento; no modifica Google Sheets ni el CSV publicado.

## Fuente y esquema de datos

La URL del CSV está centralizada en la constante `CSV_URL` al comienzo de `app.js`. Si cambia la publicación de Google Sheets, debe sustituirse únicamente esa URL y repetirse la auditoría de carga.

El esquema público actual contiene 19 columnas cuyos encabezados deben mantenerse exactamente:

1. `ID`
2. `Universidad`
3. `Vicerrectorado/Unidad Funcional Dependiente`
4. `Denominación Unidad Técnica, Gestora o Administrativa`
5. `Correo electrónico de contacto`
6. `Teléfono de contacto`
7. `Nombre de la Actividad / Acción / Iniciativa`
8. `Descripción de la Actividad / Acción / Iniciativa (máx. 250 palabras)`
9. `Dirección Web / URL Específica`
10. `Ámbito de Actuación`
11. `Tipo de Actividad`
12. `Temporalidad`
13. `Financiación`
14. `Coste de la actuación`
15. `Población destinataria`
16. `Espacio de realización`
17. `Nom de l'activitat / acció / iniciativa [VA]`
18. `Descripció de l'Activitat / Acció / Iniciativa [VA]`
19. `Adreça web / URL específica [VA]`

Cada iniciativa utiliza un ID estable con formato `CISAM-###`. Un ID existente no debe reutilizarse ni modificarse. Las nuevas iniciativas deben recibir un ID nuevo y único.

Los valores categóricos de los filtros se conservan internamente en su forma canónica publicada, normalmente en castellano; las denominaciones institucionales mantienen su nombre oficial. Las traducciones visibles no cambian esos valores internos. Los campos multirrespuesta utilizan `|` como separador y no deben sustituirlo por comas.

La actualización de Google Sheets se refleja en la aplicación cuando se actualiza el CSV publicado y la persona usuaria vuelve a cargar la página. No es necesario modificar el código mientras se mantengan la URL, los encabezados, los ID y los valores canónicos esperados.

## Idiomas

La interfaz admite:

- `es`: castellano.
- `va`: valenciano, con `html lang="ca-valencia"`.

El parámetro `lang` tiene prioridad. En ausencia de un valor válido, se utiliza la preferencia guardada en el navegador y, finalmente, castellano. La preferencia se conserva en `localStorage` dentro de operaciones protegidas; no contiene datos de las iniciativas.

Los tres campos valencianos aportan nombre, descripción y URL localizados. Si un campo valenciano está vacío o no está disponible, la aplicación utiliza el valor castellano correspondiente. La búsqueda consulta ambas versiones lingüísticas con independencia del idioma visible.

## Parámetros de URL

| Parámetro | Función |
| --- | --- |
| `lang` | Idioma |
| `q` | Búsqueda |
| `university` | Universidad |
| `scope` | Ámbito |
| `type` | Tipo |
| `timing` | Temporalidad |
| `funding` | Financiación |
| `audience` | Población |
| `space` | Espacio |
| `sort` | Ordenación |
| `id` | Ficha abierta |

Los filtros utilizan los valores canónicos de la fuente, no sus etiquetas traducidas. El número de tarjetas que se han mostrado mediante `Cargar más` no forma parte de la URL. Los parámetros desconocidos y el fragmento se conservan al canonicalizar la dirección. Un `id` válido abre directamente su ficha aunque la tarjeta no esté en el primer lote o quede fuera de los filtros activos.

Ejemplos relativos:

```text
?lang=va&q=benestar&sort=name-asc
?lang=es&id=CISAM-003
```

## Ejecución local

Ejecuta el servidor desde la carpeta del repositorio:

```bash
python -m http.server 8000
```

Abre después `http://localhost:8000/`.

En Windows, si `python` no se reconoce, prueba:

```bash
py -m http.server 8000
```

Si tampoco funciona, instala Python o utiliza la función de servidor local del editor. No abras `index.html` directamente mediante `file://`, porque la carga remota del CSV debe probarse desde un origen HTTP.

## Exportación CSV y Excel

La descarga genera un CSV de texto con estas características:

- codificación UTF-8 con BOM;
- separador `;`;
- los 19 encabezados originales;
- columnas castellanas y valencianas;
- todos los resultados filtrados, no solo las tarjetas visibles;
- comillas, punto y coma y saltos de línea escapados según CSV;
- nombre de archivo localizado según el idioma de la interfaz.

Un CSV no contiene hojas, estilos, anchos de columna, fórmulas ni otros formatos de libro. Según la versión y configuración regional de Excel, puede ser necesario importar el archivo indicando UTF-8 y `;`, utilizar **Datos → Desde texto/CSV** o ajustar visualmente anchos y saltos de línea. Una futura exportación `.xlsx` sería una función diferente y no está incluida.

## Publicación manual con GitHub Pages

La activación debe realizarse después de fusionar y revisar la versión candidata:

1. Abre el repositorio en GitHub.
2. Entra en **Settings**.
3. Selecciona **Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**.
5. Selecciona la rama `main`.
6. Selecciona la carpeta `/(root)`.
7. Guarda la configuración.
8. Espera a que finalice la publicación.
9. Abre la URL proporcionada por GitHub.

La URL esperada es `https://sarabiajm.github.io/repositorio-CISAM/`, pero no debe considerarse activa hasta comprobarla después de habilitar GitHub Pages.

La aplicación utiliza rutas relativas y parámetros de consulta, por lo que funciona como sitio de proyecto bajo `/repositorio-CISAM/` y no necesita un archivo `404.html` para su estado interno.

### Comprobaciones posteriores a la publicación

- Abrir la página principal y comprobar que aparecen 72 resultados si la fuente no ha cambiado.
- Cambiar entre castellano y valenciano.
- Confirmar que el CSV publicado continúa accesible.
- Revisar logotipo institucional y logotipos universitarios.
- Probar búsqueda, filtros y ordenación.
- Utilizar `Cargar más`.
- Abrir una ficha directa, por ejemplo `?lang=es&id=CISAM-003`.
- Abrir una URL compartida y comprobar su estado.
- Probar la copia de enlaces.
- Descargar el CSV completo y uno filtrado.
- Revisar que la consola no muestre errores.
- Comprobar la vista móvil y la ausencia de desplazamiento horizontal.

## Mantenimiento

1. Actualizar las iniciativas mediante el flujo establecido en Google Sheets y Google Forms.
2. Mantener los 19 encabezados y los valores canónicos.
3. No reutilizar ni modificar los ID existentes.
4. Asignar un ID nuevo y único a cada iniciativa nueva.
5. Completar los campos castellanos y valencianos.
6. Verificar que el CSV publicado responde y contiene únicamente información pública.
7. Revisar la aplicación mediante un servidor HTTP.
8. Probar filtros, búsqueda, ficha, idioma y enlace directo.
9. Comprobar la consola en valenciano y confirmar que no aparecen valores canónicos sin traducción.
10. Conservar una copia o historial de versiones de la hoja de mantenimiento.

Antes de publicar cambios estructurales, comprueba también el recuento de columnas, la unicidad de los ID, las URL de contacto y la compatibilidad de los encabezados con `app.js`.

## Privacidad y seguridad

El repositorio está diseñado exclusivamente para información pública. No deben incorporarse datos personales no destinados a publicación, datos sanitarios individuales, credenciales ni información confidencial.

Los valores del CSV se insertan como texto mediante nodos seguros. Las URL, correos y teléfonos se validan antes de convertirse en enlaces activos; los enlaces web externos admitidos utilizan `noopener noreferrer`. La aplicación no utiliza cookies, analítica ni seguimiento. La preferencia de idioma es el único dato almacenado localmente.

## Limitaciones conocidas

- Depende de la disponibilidad y permisos del CSV publicado.
- Es una aplicación de solo lectura y no permite editar Google Sheets desde la web.
- No incluye autenticación, backend ni base de datos propia.
- No incluye analítica ni cookies.
- No funciona sin conexión.
- No exporta libros `.xlsx` ni conserva formato de hoja de cálculo.
- GitHub Pages publica archivos estáticos, pero no valida la calidad, integridad o actualidad de los datos de origen.
- La compatibilidad debe verificarse nuevamente si cambian el esquema, los valores canónicos o la política de publicación del CSV.

## Verificación técnica básica

```bash
node --check app.js
git diff --check
python -m http.server 8000
```

La revisión completa debe incluir carga del CSV, consola, recursos, búsqueda bilingüe, filtros, URL, historial, fichas directas, carga progresiva, descarga y diseño adaptable.
