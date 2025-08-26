# Revisión Post-Mortem

Al finalizar el proyecto, se realizó una revisión post-mortem de este para analizar qué se hizo bien y qué aspectos se pueden mejorar.

## Aspectos positivos

- Diseño de un pipeline CI/CD robusto que incluye publicación de imágenes a Docker Hub, tests de regresión y deploy a un server de producción.
- Clara separación de responsabilidades entre frontend y backend.
- Autenticación robusta con Keycloak.
- Implementación de un stack de observabilidad con Prometheus y Grafana.
- Automatización del testing del frontend con Playwright para realizar pruebas de usabilidad, compatibilidad y de navegadores.
- Definición clara y robusta de los perfiles del Docker Compose.
- El código tiene una estructura homogénea gracias a la configuración de linting.
- Uso de una base de datos robusta para almacenar los datos del sistema.
- Testing de estrés para evaluar cómo reacciona el sistema bajo carga con JMeter.
- Realización de pruebas de aceptación utilizando Cucumber.
- Organización clara de las tareas del proyecto utilizando Jira.
- Cumplimiento de todos los requisitos funcionales del sistema.

## Áreas de Mejora

- Hacer pruebas mas exhaustivas de seguridad en el sistema.
- Realizar un entorno de prueba totalmente similar a producción para observar cómo será el sistema cuando se publique.
- Creación de un pipeline más robusto incluyendo métricas como las brindadas por JMeter.
- Configurar alertas de correo para cuando el sistema se cae o pasa a un estado *unhealthy*.
- Utilizar SDKs oficiales en vez de soluciones de terceros, como es el caso para la autenticación.
- Implementar *caching* de respuestas del backend en endpoints que no cambian mucho con el tiempo.
- Implementar un *rate limiter* para reducir la posibilidad de ataques DDoS.
- Implementar un sistema de *load balancing* para reducir la carga de un único servidor para múltiples usuarios.
