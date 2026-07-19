# Repositorio de Iniciativas en Salud Mental de las Universidades Valencianas

Aplicación web estática, sin frameworks, backend, base de datos, npm ni proceso de compilación. Consulta el CSV publicado en Google Sheets y ofrece búsqueda, filtros combinables, ordenación, fichas ampliadas y descarga de los resultados filtrados.

El archivo descargado utiliza punto y coma (`;`) como separador para facilitar su apertura por columnas en Excel con configuración regional española.

## Estructura

- `index.html`: estructura accesible de la interfaz.
- `styles.css`: estilos adaptables a móvil y escritorio.
- `app.js`: carga, parser CSV, filtros, renderizado y descarga.
- `assets/`: logotipo institucional de la cabecera y logotipos de las universidades participantes.
- `.gitignore`: exclusiones básicas del proyecto.

## Ejecución local

Desde esta carpeta, ejecuta:

```bash
python -m http.server 8000
```

Abre `http://localhost:8000` en el navegador. Se necesita un servidor HTTP porque el navegador puede bloquear `fetch` de archivos locales (`file://`).

## Publicación en GitHub Pages

1. Sube estos archivos a un repositorio de GitHub.
2. En **Settings → Pages**, selecciona **Deploy from a branch**.
3. Elige la rama (por ejemplo `main`) y la carpeta `/ (root)`.
4. Guarda y abre la URL que GitHub Pages genere.

## Cambiar la URL del CSV

Edita la constante `CSV_URL` al principio de `app.js`. El nuevo recurso debe estar publicado y permitir peticiones desde el dominio de la aplicación mediante CORS.

## Limitaciones conocidas

- La aplicación depende de que el CSV publicado esté disponible y permita CORS.
- Los nombres de las columnas deben coincidir con los encabezados esperados por el repositorio.
- No hay persistencia de filtros ni edición de datos: la fuente de verdad es el CSV.
