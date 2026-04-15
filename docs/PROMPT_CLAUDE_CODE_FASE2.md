# FASE 2 — WEBAPP DOCAGENT (antes MediPanel)

## REBRANDING
- Renombrar todo de "MediPanel" a "DocAgent"
- Logo: usar la imagen del robot doctor con estetoscopio que está en /docs/logo_docagent.png
- Favicon: usar el mismo logo
- Nombre en sidebar: "DocAgent"
- Footer: "DocAgent v2.0"

- Colores de marca: azul primario (#2563EB), fondo claro (#F8FAFC)

## AUTENTICACIÓN REAL
- Implementar login funcional con NextAuth.js
- Cada médico registrado en la tabla `medicos` de la BD puede loguearse
- Campos de login: email + contraseña
- Agregar campo `password_hash` a la tabla medicos (ALTER TABLE)
- Crear página de registro para nuevos médicos (nombre, apellido, email, contraseña, matrícula, especialidad)
- Después del login, el médico solo ve SUS pacientes y SUS consultas (filtrar todo por medico_id)
- Sesión persistente (no pedir login cada vez que recarga la página)
- Botón de cerrar sesión en el sidebar
- Seed: crear usuario para Dr. Blas Mazza (ID: 48315179-21eb-406d-8c8b-e172d120bdcf, email: blasmazza@yahoo.com, password: temporal123)

## DASHBOARD
- Métricas reales del médico logueado: Total pacientes, Consultas activas (en_curso), Nuevos hoy, Casos urgentes (alarma=true)
- Gráfico de consultas por día (últimos 30 días) con datos reales
- Lista de consultas recientes con: avatar, nombre paciente, motivo, fecha, badge de estado (Urgente/Completa/En curso), flecha de acceso
- Búsqueda por nombre o teléfono
- Todo filtrado por el medico_id del médico logueado

## LISTA DE PACIENTES
- Tabla completa con: Nombre, Apellido, DNI, Edad, Sexo, Prepaga, Celular, Última consulta, Total consultas
- Búsqueda por nombre, apellido o DNI
- Filtro por prepaga
- Paginación (20 por página)
- Click abre ficha del paciente

## FICHA DEL PACIENTE
- Datos personales completos editables (nombre, apellido, DNI, edad, sexo, fecha nacimiento, domicilio, email, celular, prepaga, plan, credencial)
- Historial de todas las consultas del paciente, ordenadas por fecha (más reciente primero)
- Cada consulta muestra: fecha, sistema, motivo, estado, indicador de alarma
- Click en consulta abre el detalle

## DETALLE DE CONSULTA — DOS COLUMNAS
- Header: nombre paciente + badge estado + teléfono + fecha
- Columna izquierda — Conversación: chat con burbujas azules (agente) y grises (paciente) desde tabla mensajes_consulta. Si vacía: "Los mensajes de esta consulta no están disponibles aún"
- Columna derecha — Ficha clínica:
  - RED FLAGS (si alarma=true): card fondo rojo claro, ícono ⚠, listado de signos de alarma
  - Motivo de consulta
  - Síntomas (parseados del JSONB)
  - Duración
  - Intensidad
  - Evolución
  - Localización
  - Factores que empeoran/alivian
  - Medicación habitual
  - Alergias
  - Cobertura (dentro/fuera + prepaga)
  - Botón "Ver informe" (abre Google Doc en nueva pestaña)
  - Botón "Marcar como revisado" (actualiza informe.estado a "revisado" y informe.revisado_at)

## DEVOLUCIÓN DEL MÉDICO (NUEVO)
- En el detalle de cada consulta, agregar una sección "Devolución del médico" debajo de la ficha clínica
- Un campo de texto grande (textarea) donde el médico puede escribir su devolución/diagnóstico/indicaciones
- Botón "Guardar devolución"
- Se guarda en la tabla consultas en un nuevo campo `devolucion_medico` (TEXT)
- Si ya hay una devolución guardada, mostrarla con fecha y hora de cuándo se escribió
- Agregar campo `devolucion_medico` y `devolucion_at` a la tabla consultas (ALTER TABLE)

## PÁGINA DE ALERTAS
- Lista de todas las consultas con alarma=true del médico logueado
- Ordenadas por fecha (más reciente primero)
- Card destacada en rojo con: nombre paciente, motivo alarma, fecha, sistema
- Click abre el detalle de la consulta
- Badge con cantidad de alertas no revisadas en el sidebar

## CONFIGURACIÓN
- Perfil del médico: ver y editar nombre, apellido, email, teléfono, especialidad, matrícula
- Cambiar contraseña
- Zonas de cobertura: ver y editar el array de zonas
- System prompt: textarea para ver y editar el prompt del agente IA (campo system_prompt de la tabla medicos)

## DISEÑO Y UX
- Seguir el estilo de las imágenes de referencia en /docs/
- Sidebar izquierdo fijo con logo DocAgent, navegación con íconos, badge de alertas, info del doctor, botón cerrar sesión
- Cards con bordes redondeados, sombras sutiles
- Badges: Urgente (rojo), Completa (verde), En curso (azul)
- Avatares circulares con inicial del nombre
- Responsive: tablet y desktop
- Fechas: dd/mm/aaaa formato argentino
- Timezone: America/Argentina/Buenos_Aires
- Campos NULL: mostrar "-" o "No informado"
- Loading states y empty states
- Todos los botones deben funcionar (no placeholders)

## CAMBIOS EN BASE DE DATOS (ejecutar ALTER TABLE)
```sql
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS devolucion_medico TEXT;
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS devolucion_at TIMESTAMP;
```
Después de agregar las columnas, correr `npx prisma db pull` para actualizar el schema.

## REGLAS IMPORTANTES
1. NO crear tablas nuevas, solo agregar columnas con ALTER TABLE
2. Usar `prisma db pull` después de los ALTER TABLE
3. Todo filtrado por medico_id del usuario logueado
4. Todos los botones deben ser funcionales, nada de "Próximamente"
5. Verificar que no haya errores de TypeScript antes de hacer push
6. Correr `npx tsc --noEmit` antes de cada push
7. El login debe ser seguro (hashear contraseñas con bcrypt)
8. Hacer push cuando todo esté listo