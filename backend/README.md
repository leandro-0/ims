# IMS Backend

## Preparación para correr los tests de Cucumber

- Iniciar perfil de tests de docker compose

```
docker compose -p ims-test --profile test up -d
```

- Acceder a Keycloak con las credenciales del administrador

  - Crear usuario con credenciales "admin@example.com" y "admin1"
  - Asignar el rol `role_admin` de `ims` a ese usuario

- Correr los tests accediendo a [`CucumberTest.java`](/src/test/java/org/example/imsbackend/CucumberTest.java) y presionando el botón de correr.
