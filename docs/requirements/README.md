# Documentación de requisitos

En esta sección se detallan los requisitos funcionales y no funcionales de nuestro proyecto.

## Requisitos funcionales

|                                    | Requisito Funcional      | Descripción                                                                                                                                  |
| ---------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gestión de Productos**           | Agregar Producto         | Permitir a administradores y empleados agregar nuevos productos con nombre, descripción, categoría, precio, cantidad inicial y stock mínimo. |
|                                    | Editar Producto          | Permitir a administradores y empleados editar la información de un producto existente.                                                       |
|                                    | Eliminar Producto        | Permitir a administradores eliminar productos del inventario.                                                                                |
|                                    | Visualizar Productos     | Mostrar una lista de productos con opciones de búsqueda y filtrado para todos los roles.                                                     |
| **Control de Stock**               | Actualizar Stock         | Permitir a administradores y empleados registrar entradas y salidas de productos en el inventario.                                           |
|                                    | Alertas por Stock Mínimo | Generar alertas automáticas en el dashboard cuando un producto alcance o caiga por debajo del stock mínimo.                                  |
|                                    | Historial de Movimientos | Registrar entradas/salidas con fecha, hora, cantidad y usuario responsable, accesible para Administradores y Empleados.                      |
| **Integración con Otros Sistemas** | API de Integración       | Proporcionar una API RESTful protegida con JWT para operaciones CRUD de productos para administradores.                                      |
| **Interfaz de Usuario**            | Dashboard                | Mostrar un tablero con visión general del inventario y estadísticas clave.                                                                   |
|                                    | Usabilidad               | Garantizar una interfaz intuitiva con navegación clara y accesible para usuarios.                                                            |
| **Roles y Niveles de Acceso**      | Administrador            | Acceso completo a todas las funcionalidades.                                                                                                 |
|                                    | Empleado                 | Acceso a gestión de productos (agregar, editar, visualizar, no eliminar) y control de stock (actualizar, historial).                         |
|                                    | Invitado                 | Acceso limitado a visualización de productos.                                                                                                |

## Requisitos no funcionales

| Grupo              | Requisito No Funcional         | Descripción                                                                         |
| ------------------ | ------------------------------ | ----------------------------------------------------------------------------------- |
| **Seguridad**      | Pruebas de Seguridad           | Realización de pruebas de penetración y análisis de vulnerabilidades.               |
|                    | Protección contra Amenazas     | Implementación de medidas preventivas contra ataques externos.                      |
| **Rendimiento**    | Capacidad de Carga             | El sistema debe manejar altos volúmenes de tráfico y transacciones sin degradación. |
|                    | Pruebas de Estrés              | Evaluación del rendimiento bajo carga usando herramientas como JMeter.              |
|                    | Optimización de Recursos       | Uso eficiente de memoria, CPU y ancho de banda.                                     |
| **Usabilidad**     | Pruebas de Usabilidad          | Evaluación sistemática de la interfaz y experiencia del usuario.                    |
| **Compatibilidad** | Compatibilidad Multi-navegador | Funcionamiento correcto en las últimas versiones de Chrome, Firefox, Safari y Edge. |
|                    | Pruebas Automatizadas          | Uso de Playwright para pruebas de compatibilidad.                                   |
| **Confiabilidad**  | Pruebas de Regresión           | Implementación de pruebas automatizadas para prevenir errores en modificaciones.    |
|                    | Pruebas de Aceptación          | Validación mediante Cucumber para cumplir requisitos del usuario.                   |
|                    | Integridad de Datos            | Garantía de consistencia y precisión de la información del inventario.              |
|                    | Recuperación de Errores        | Mecanismos para manejar y recuperarse de fallos.                                    |
| **Mantenibilidad** | Calidad de Código              | Implementación de revisiones de código para garantizar consistencia y legibilidad.  |
|                    | Gestión de Migraciones         | Uso de Flyway para migraciones de base de datos.                                    |
|                    | Contenedorización              | Implementación con Docker para consistencia entre entornos.                         |
|                    | Estructura Modular             | Arquitectura que facilite modificaciones y extensiones.                             |
| **Escalabilidad**  | Arquitectura Escalable         | Diseño que permita crecimiento horizontal y vertical.                               |
|                    | Pipeline CI/CD                 | Automatización del despliegue con GitHub Actions.                                   |
|                    | Gestión de Ambientes           | Entornos de prueba que simulen producción.                                          |
| **Observabilidad** | Instrumentación                | Implementación de OpenTelemetry para métricas, trazas y logs.                       |
|                    | Monitoreo Continuo             | Uso de Prometheus y Grafana para visualización del estado del sistema.              |
|                    | Métricas de Calidad            | Seguimiento de cobertura de pruebas y densidad de defectos.                         |
| **Disponibilidad** | Monitoreo de Salud             | Verificación continua del estado del sistema en producción.                         |
|                    | Mantenimiento Programado       | Ciclo regular de actualizaciones y mantenimiento.                                   |
| **Portabilidad**   | Contenedorización              | Uso de Docker para portabilidad entre entornos.                                     |
|                    | Configuración Flexible         | Adaptación a diferentes entornos de despliegue.                                     |
