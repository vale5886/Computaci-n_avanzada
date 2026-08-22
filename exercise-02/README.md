# Ejercicio 02 — Riesgo psicosocial laboral en Chile 2025

## Pregunta

¿Qué actividades económicas en Chile combinan un mayor nivel de riesgo psicosocial no óptimo y una mayor cantidad de centros de trabajo evaluados durante 2025?

## Fuente de datos

Superintendencia de Seguridad Social (SUSESO), Documento de Trabajo N° 27: *Riesgo psicosocial laboral en Chile. Resultados de la aplicación del Cuestionario CEAL-SM/SUSESO en 2025*.

Se utilizan dos tablas del informe:

- Tabla 6: número de centros de trabajo evaluados por actividad económica.
- Tabla 9: porcentaje de centros de trabajo en riesgo no óptimo por actividad económica.

### Nota de consistencia de la fuente

La Tabla 6 informa 20.913 centros de trabajo y coincide con el total general reportado por el estudio. La Tabla 9 presenta pequeñas diferencias en varios conteos y un total de 20.932 centros. Para no ocultar ni corregir silenciosamente esa inconsistencia, este ejercicio usa los conteos de centros de la Tabla 6 y únicamente los porcentajes de riesgo no óptimo de la Tabla 9.

## Variables y mappings

1. **Actividad económica → posición de la torre.** Cada actividad ocupa una posición en el campo 3D.
2. **Riesgo psicosocial no óptimo → altura.** El dato real se normaliza y se mapea a una altura visual entre 1 y 8 unidades.
3. **Número de centros evaluados → ancho.** El dato real se normaliza y se mapea a un ancho visual entre 0,8 y 3 unidades.

El color refuerza el mismo dato de riesgo: menor riesgo relativo se representa con un tono más claro y mayor riesgo relativo con un tono más intenso. El color no constituye una clasificación oficial de SUSESO.

## Escala y normalización

Se aplica normalización min-max:

`normalizado = (valor - mínimo) / (máximo - mínimo)`

Luego el valor normalizado se transforma al rango visual definido para cada propiedad:

- Riesgo real: 4,7% a 44,0% → altura: 1 a 8 unidades.
- Centros reales: 84 a 3.429 → ancho: 0,8 a 3 unidades.

Esto permite preservar la comparación entre datos sin convertir directamente los valores reales en metros o unidades de escena.

## Interacción

- Clic sobre una torre para consultar el dato real y su valor visual normalizado.
- Selector de actividad económica.
- Ordenar las actividades según el orden de la fuente, mayor riesgo o mayor cantidad de centros evaluados.
- Navegación 3D mediante órbita, zoom y rotación.

## Interpretación

La visualización se plantea como apoyo exploratorio a la toma de decisiones: permite identificar sectores que combinan niveles altos de riesgo psicosocial con una presencia importante de centros evaluados. No constituye por sí sola una recomendación de inversión ni demuestra que una intervención de neuroarquitectura sea apropiada para un sector. Esa pertinencia requeriría un análisis posterior de las causas del riesgo y de las variables espaciales susceptibles de intervención.
