# AI Usage Log

Documenta de manera breve cuándo y para qué utilizaste asistentes de IA. El objetivo no es registrar cada mensaje, sino mantener trazabilidad sobre decisiones importantes.

## Registro

### 2026-08-21 - Ejercicio 02 visualización CEAL-SM/SUSESO

**Herramienta / agente:** ChatGPT  
**Qué pedí:** Analizar el informe CEAL-SM/SUSESO 2025, definir una pregunta de diseño con datos y construir una primera visualización tridimensional que respetara escala, normalización y rango visual.  
**Qué cambió en el proyecto:** Se creó `/exercise-02/` con un dataset local de 19 actividades económicas, tres mappings principales —actividad a posición, riesgo no óptimo a altura y centros evaluados a ancho—, color como refuerzo del riesgo, normalización min-max e interacción mediante selección y ordenamiento.  
**Qué revisé o corregí manualmente:** Se decidió utilizar los conteos de centros de la Tabla 6 y los porcentajes de riesgo no óptimo de la Tabla 9, documentando la diferencia de totales existente entre ambas tablas.  
**Qué aprendí / qué error apareció:** Los datos reales no deben traducirse directamente a unidades de la escena; primero se normalizan y luego se mapean a un rango visual que preserve la comparación sin destruir la legibilidad.

### 2026-08-21 - LAB03 representación de datos

**Herramienta / agente:** ChatGPT  
**Qué pedí:** Revisar la pauta de LAB03, corregir la estructura del repositorio y modificar una sola regla de representación sin alterar el resto del sistema.  
**Qué cambió en el proyecto:** LAB03 quedó integrado en `/lab-03/`. Se cambió la regla del ancho: antes representaba el porcentaje de ocupación y ahora representa la proporción de anclajes libres respecto de la capacidad de cada estación. También se actualizó la leyenda y el README para que el mapping sea explícito.  
**Qué revisé o corregí manualmente:** Verifiqué que la URL pública de `/lab-03/` funciona en el navegador antes de aplicar la modificación.  
**Qué aprendí / qué error apareció:** Una misma fuente de datos puede producir lecturas distintas según el mapping elegido; cambiar una regla cambia el significado de la geometría, no solo su apariencia.

### 2026-08-20 - LAB02 campo generativo

**Herramienta / agente:** ChatGPT  
**Qué pedí:** Modificar `lab-02/main.js` para cambiar los cubos por esferas, agregar un pequeño efecto de rebote al cambiar parámetros y hacer que las esferas suban cuando el cursor se acerca y vuelvan a su posición al alejarlo.  
**Qué cambió en el proyecto:** Se reemplazó `BoxGeometry` por `SphereGeometry`, se agregó una animación de rebote amortiguado y una interacción con el cursor basada en distancia sobre el plano del campo.  
**Qué revisé o corregí manualmente:** Pendiente de revisión visual final en la versión publicada del LAB02.  
**Qué aprendí / qué error apareció:** El comportamiento del campo no depende solo de la forma de los objetos, sino también de reglas de posición, animación e interacción.

### YYYY-MM-DD - tarea

**Herramienta / agente:**  
**Qué pedí:**  
**Qué cambió en el proyecto:**  
**Qué revisé o corregí manualmente:**  
**Qué aprendí / qué error apareció:**  
