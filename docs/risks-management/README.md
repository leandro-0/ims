# Gestión de Riesgos

En esta sección se identifican y documentan los posibles riesgos del proyecto Inventory Management System (IMS). De igual modo, se planifican estrategias de mitigación.

| **Riesgo**                                           | **Descripción**                                                                       | **Plan de mitigación**                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Problemas de compatibilidad del frontend             | La interfaz puede no funcionar correctamente en todos los navegadores o dispositivos. | Usar Playwright para pruebas automatizadas en navegadores y dispositivos clave.                          |
| Problemas técnicos con contenedorización             | Errores en la configuración de Docker pueden causar inconsistencias entre entornos.   | Crear un Dockerfile y docker-compose bien documentado y probar contenedores en entornos locales primero. |
| Fallos en la gestión de migraciones de base de datos | Migraciones de Flyway mal configuradas pueden corromper datos o causar errores.       | Realizar migraciones en entornos de prueba y mantener copias de seguridad regulares.                     |
| Falta de cobertura en pruebas de aceptación          | Pruebas de aceptación incompletas pueden dejar defectos sin detectar.                 | Usar Cucumber de manera exhaustiva para automatizar casos de prueba basados en requisitos funcionales.   |
| Incumplimiento del cronograma                        | Subestimación de tareas puede retrasar entregas del proyecto.                         | Crear un cronograma detallado para monitorear el progreso periódicamente.                                |
| Problemas de seguridad en la API                     | Una mala implementación de JWT puede exponer vulnerabilidades en la API.              | Seguir mejores prácticas para JWT y realizar pruebas de seguridad.                                       |
| Falta de experiencia con las tecnologías usadas      | Tecnologías como Spring Boot o Playwright pueden ser nuevas para el equipo.           | Investigar y documentarse bien al inicio y durante el transcurso del proyecto.                           |
| Errores en la integración de la API                  | Endpoints mal definidos pueden causar fallos en la integración con clientes externos. | Hacer las pruebas correspondientes a cada endpoint.                                                      |
| Errores en la auditoría de datos                     | Configuración incorrecta de Hibernate Envers puede omitir registros de auditoría.     | Probar auditoría en entorno de desarrollo y verificar registros.                                         |
