# Repositorio de Iniciativas en Salud Mental de las Universidades Valencianas

Aplicación web estática, sin frameworks, backend, base de datos, npm ni proceso de compilación. Consulta el CSV publicado en Google Sheets y ofrece búsqueda, filtros combinables, ordenación, fichas ampliadas y descarga de los resultados filtrados.

El archivo descargado utiliza punto y coma (`;`) como separador para facilitar su apertura por columnas en Excel con configuración regional española.

## Estructura

- `index.html`: estructura accesible de la interfaz.
- `styles.css`: estilos adaptables a móvil y escritorio.
- `app.js`: carga, parser CSV, filtros, renderizado y descarga.
- `assets/`: logotipo institucional de la cabecera y logotipos de las universidades participantes.
- `.gitignore`: exclusiones básicas del proyecto.
