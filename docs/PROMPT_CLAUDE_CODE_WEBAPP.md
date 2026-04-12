# PROMPT PARA CLAUDE CODE — WEBAPP CLÍNICA VIRTUAL

## CONTEXTO DEL PROYECTO

Estoy construyendo un SaaS de clínica virtual. Actualmente tengo un sistema donde pacientes se comunican por WhatsApp con un agente de IA que realiza una entrevista clínica completa. Los datos se guardan en una base de datos PostgreSQL. Necesito una webapp para que el médico pueda ver toda la información de sus pacientes, consultas e informes.

---

## STACK TECNOLÓGICO

- **Framework:** Next.js 14+ (App Router)
- **ORM:** Prisma
- **Base de datos:** PostgreSQL (ya existente, NO crear tablas nuevas, conectarse a las existentes)
- **Estilos:** Tailwind CSS
- **Autenticación:** NextAuth.js con login por email/password (por ahora solo para el médico)
- **Hosting:** Se va a hostear en Easypanel (Docker) en un VPS

---

## CONEXIÓN A LA BASE DE DATOS

La base de datos ya existe y tiene datos. Usar Prisma con `db pull` para generar el schema desde la base existente.

**Credenciales de conexión:**
```
DATABASE_URL="postgresql://postgres:fc952adf1733c9d91d4b@n8n_postgres:5432/clinica_virtual?sslmode=disable"
```

Nota: `n8n_postgres` es el host interno en la red Docker de Easypanel. Si se corre localmente para desarrollo, cambiar por la IP del servidor.

---

## ESTRUCTURA DE LA BASE DE DATOS (8 TABLAS)

### Tabla: medicos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID, PK | Identificador único |
| nombre | VARCHAR(100) | Nombre del médico |
| apellido | VARCHAR(100) | Apellido del médico |
| matricula_nacional | VARCHAR(20), UNIQUE | Matrícula profesional |
| especialidad | VARCHAR(100) | Especialidad médica |
| email | VARCHAR(150), UNIQUE | Email del médico |
| telefono | VARCHAR(30) | Teléfono |
| formacion | TEXT | Títulos y formación |
| experiencia | TEXT | Experiencia profesional |
| zonas_cobertura | JSONB | Array de zonas de atención domiciliaria |
| system_prompt | TEXT | Prompt del agente IA personalizado |
| activo | BOOLEAN | Si está activo en el sistema |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### Tabla: pacientes
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID, PK | Identificador único |
| medico_id | UUID, FK → medicos | Médico que lo atiende |
| nombre | VARCHAR(100) | Nombre del paciente |
| apellido | VARCHAR(100) | Apellido |
| edad | INTEGER | Edad en años |
| sexo | VARCHAR(20) | masculino/femenino |
| fecha_nacimiento | DATE | Fecha de nacimiento |
| domicilio | TEXT | Dirección completa |
| dni | VARCHAR(15) | Documento de identidad |
| email | VARCHAR(150) | Email del paciente |
| celular | VARCHAR(30) | Número de celular |
| prepaga | VARCHAR(100) | Nombre de la prepaga/obra social |
| plan | VARCHAR(50) | Plan contratado |
| credencial | VARCHAR(50) | Número de credencial |
| created_at | TIMESTAMP | Primera consulta |
| updated_at | TIMESTAMP | Última actualización |

Constraint: UNIQUE(medico_id, dni) — un DNI no se puede repetir para el mismo médico.

### Tabla: consultas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID, PK | Identificador único |
| paciente_id | UUID, FK → pacientes | Paciente de la consulta |
| medico_id | UUID, FK → medicos | Médico asignado |
| sistema | VARCHAR(50) | Sistema afectado: GASTROINTESTINAL, URINARIO, NEUROLÓGICO, RESPIRATORIO_BAJO, RESPIRATORIO_ALTO, DERMATOLÓGICO, CARDIOVASCULAR, CRONICO_COMPLEJO |
| motivo | TEXT | Motivo de consulta |
| evolucion | TEXT | Evolución del cuadro |
| sintomas | JSONB | Síntomas reportados (objeto con sintomas_actuales y características) |
| protocolo | JSONB | Preguntas y respuestas del protocolo clínico |
| medicacion_habitual | TEXT | Medicación que toma el paciente |
| alergias | TEXT | Alergias reportadas |
| alarma | BOOLEAN | Si se activó alarma de emergencia |
| motivo_alarma | TEXT | Qué disparó la alarma |
| estado | VARCHAR(20) | en_curso, finalizada, cancelada |
| datos_json_completo | JSONB | JSON completo de respaldo |
| dentro_cobertura | BOOLEAN | Si el domicilio está en zona de cobertura |
| created_at | TIMESTAMP | Inicio de la consulta |
| finalizada_at | TIMESTAMP | Momento de cierre |

### Tabla: mensajes_consulta
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID, PK | Identificador único |
| consulta_id | UUID, FK → consultas | Consulta asociada |
| rol | VARCHAR(20) | paciente / agente |
| contenido | TEXT | Texto del mensaje |
| orden | INTEGER | Secuencia del mensaje |
| created_at | TIMESTAMP | Momento del mensaje |

### Tabla: archivos_consulta
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID, PK | Identificador único |
| consulta_id | UUID, FK → consultas | Consulta asociada |
| tipo | VARCHAR(30) | foto_lesion, foto_garganta, otro |
| url | TEXT | URL del archivo almacenado |
| nombre_archivo | VARCHAR(200) | Nombre del archivo |
| created_at | TIMESTAMP | Momento de subida |

### Tabla: informes
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID, PK | Identificador único |
| consulta_id | UUID, FK → consultas, UNIQUE | 1 informe por consulta |
| google_doc_url | TEXT | URL del Google Doc/PDF |
| google_doc_id | VARCHAR(100) | ID del documento en Google Drive |
| estado | VARCHAR(20) | generado, enviado, revisado |
| enviado_at | TIMESTAMP | Cuándo se envió al paciente |
| revisado_at | TIMESTAMP | Cuándo el médico lo revisó |
| created_at | TIMESTAMP | Momento de creación |

### Tabla: planes
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID, PK | Identificador único |
| nombre | VARCHAR(50) | Básico, Pro, Premium |
| precio_mensual | DECIMAL(10,2) | Precio mensual |
| max_consultas_mes | INTEGER | NULL = ilimitado |
| descripcion | TEXT | Descripción del plan |
| activo | BOOLEAN | Si está disponible |
| created_at | TIMESTAMP | Fecha de creación |

### Tabla: suscripciones
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID, PK | Identificador único |
| medico_id | UUID, FK → medicos | Médico suscrito |
| plan_id | UUID, FK → planes | Plan contratado |
| estado | VARCHAR(20) | activa, pausada, cancelada |
| fecha_inicio | DATE | Inicio de la suscripción |
| fecha_fin | DATE | NULL si es recurrente |
| fecha_proximo_pago | DATE | Próximo cobro |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### RELACIONES
- Un médico tiene muchos pacientes
- Un paciente tiene muchas consultas
- Una consulta tiene muchos mensajes y archivos
- Una consulta tiene un informe
- Un médico tiene una suscripción activa vinculada a un plan

---

## DATOS DE PRUEBA YA EXISTENTES

Ya hay un médico registrado:
- **ID:** 48315179-21eb-406d-8c8b-e172d120bdcf
- **Nombre:** Blas Mazza
- **Matrícula:** 90883
- **Email:** blasmazza@yahoo.com

Ya hay pacientes y consultas reales en la base de datos.

---

## FUNCIONALIDADES DE LA WEBAPP (MVP)

### 1. LOGIN
- Pantalla de login con email y contraseña
- Por ahora, crear un usuario admin hardcodeado o con seed para el Dr. Mazza
- Después de login, redirigir al dashboard

### 2. DASHBOARD PRINCIPAL
- Mostrar métricas resumidas:
  - Total de pacientes
  - Consultas del día / semana / mes
  - Consultas con alarma activa (destacadas en rojo)
  - Consultas pendientes de revisión
- Gráfico de consultas por día (últimos 30 días)
- Lista de últimas 10 consultas con: nombre paciente, sistema, motivo, fecha, estado, si tiene alarma

### 3. LISTA DE PACIENTES
- Tabla con todos los pacientes del médico
- Columnas: Nombre completo, DNI, Edad, Sexo, Prepaga, Celular, Última consulta, Total consultas
- Búsqueda por nombre, apellido o DNI
- Filtro por prepaga
- Click en un paciente abre su ficha

### 4. FICHA DEL PACIENTE
- Datos personales completos (nombre, apellido, DNI, edad, sexo, fecha nacimiento, domicilio, email, celular, prepaga, plan, credencial)
- Historial de consultas: lista de todas las consultas ordenadas por fecha (más reciente primero)
- Cada consulta muestra: fecha, sistema, motivo, estado, si tuvo alarma
- Click en una consulta abre el detalle

### 5. DETALLE DE CONSULTA (VISTA DE DOS COLUMNAS)
- Layout de dos columnas como se describe en la sección DISEÑO Y UX
- Columna izquierda: chat completo de la conversación (tabla mensajes_consulta)
- Columna derecha: ficha clínica con todos los datos estructurados
- Header con nombre del paciente, estado, teléfono, fecha
- Sección RED FLAGS destacada si alarma = true
- Datos clínicos parseados del JSONB: síntomas, duración, intensidad, evolución, localización, factores
- Medicación habitual y alergias
- Cobertura (dentro/fuera de zona)
- Enlace al informe (si existe): botón para abrir el Google Doc/PDF
- Botón para marcar como "revisado" (actualiza estado del informe a "revisado" y guarda revisado_at)
- Si no hay mensajes en mensajes_consulta, mostrar placeholder "Los mensajes de esta consulta no están disponibles aún"

### 6. CONSULTAS CON ALARMA
- Vista especial que filtra solo consultas con alarma = true
- Ordenadas por fecha (más reciente primero)
- Destacadas visualmente
- Acceso rápido al detalle y al informe

---

## DISEÑO Y UX

### Estilo general
- Diseño limpio, profesional y moderno. Estética médica/clínica tipo "MediPanel".
- Colores: fondo blanco/gris muy claro (#F8FAFC), cards con bordes suaves, acentos en azul médico (#2563EB). Rojo (#EF4444) para alarmas y urgencias. Verde (#22C55E) para estados completados/revisados.
- Sidebar izquierdo fijo con fondo blanco, logo arriba, navegación con íconos: Dashboard, Pacientes, Alertas, Configuración. Item activo resaltado en azul.
- Responsive (que funcione en tablet y desktop del médico)
- Tipografía clara y legible, sans-serif (Inter o similar)
- Bordes redondeados (rounded-xl) en cards y contenedores
- Sombras muy sutiles en cards (shadow-sm)
- Loading states y empty states para cuando no hay datos
- Formato de fechas: dd/mm/aaaa (formato argentino)
- Idioma: todo en español
- Versión del sistema visible en el footer del sidebar (ej: "MediPanel v1.0")

### Dashboard
- Cards de métricas arriba con: Consultas activas, Nuevos hoy, Casos urgentes. Cada card con ícono a la derecha y número grande.
- Debajo: sección "Pacientes recientes" con barra de búsqueda y lista tipo WhatsApp:
  - Avatar circular con inicial del nombre (coloreado)
  - Nombre completo + ícono de alerta si es urgente
  - Teléfono debajo del nombre
  - Fecha y hora a la derecha
  - Badge de estado: "Urgente" (rojo), "Completa" (verde), "En curso" (azul)
  - Flecha ">" para acceder al detalle
- Link "Ver todos" para ir a la lista completa de pacientes

### Detalle de consulta — LAYOUT DE DOS COLUMNAS
La vista de detalle de una consulta debe tener un layout de dos columnas:

**Header:**
- Nombre completo del paciente + badge de estado (Urgente/Completa) + ícono de alerta si aplica
- Teléfono del paciente
- Fecha de registro
- Dropdown para cambiar estado (arriba a la derecha)
- Botón de volver (flecha ←)

**Columna izquierda — Conversación:**
- Título "Conversación" con contador de mensajes
- Chat estilo WhatsApp/burbuja:
  - Mensajes del agente: burbujas azules (#2563EB) con texto blanco, alineadas a la izquierda
  - Mensajes del paciente: burbujas grises claras (#F1F5F9), alineadas a la izquierda con avatar
  - Hora debajo de cada burbuja
  - Scroll vertical si hay muchos mensajes
- Si no hay mensajes (tabla mensajes_consulta vacía): mostrar "Los mensajes de esta consulta no están disponibles aún"

**Columna derecha — Ficha clínica:**
- Título "Ficha clínica" con subtítulo "Datos de preconsulta"
- Sección "RED FLAGS" (solo si alarma = true): card con fondo rojo claro (#FEF2F2), borde rojo, con ícono de alerta y listado de los signos de alarma del campo motivo_alarma. Cada item con ícono ⚠ en rojo.
- Sección "MOTIVO DE CONSULTA": ícono + texto del motivo
- Sección "SÍNTOMAS": ícono + lista de síntomas parseados del JSONB
- Sección "DURACIÓN": tiempo de evolución
- Sección "INTENSIDAD": nivel reportado
- Sección "EVOLUCIÓN": estado actual
- Sección "LOCALIZACIÓN": zona corporal
- Sección "FACTORES": qué empeora y qué alivia
- Sección "MEDICACIÓN HABITUAL": medicamentos
- Sección "ALERGIAS": alergias reportadas
- Sección "COBERTURA": dentro/fuera de zona + prepaga
- Botón "Ver informe" para abrir el Google Doc/PDF
- Botón "Marcar como revisado" (si el informe está en estado "enviado")

---

## ESTRUCTURA DE ARCHIVOS SUGERIDA

```
/app
  /login
  /dashboard
  /pacientes
    /[id]          (ficha del paciente)
  /consultas
    /[id]          (detalle de consulta)
  /alarmas
  /configuracion
/components
  /ui              (botones, cards, badges, tablas)
  /layout          (sidebar, header)
  /dashboard       (widgets de métricas)
  /pacientes       (tabla, ficha)
  /consultas       (tabla, detalle)
/lib
  /prisma.ts       (cliente Prisma)
  /auth.ts         (configuración NextAuth)
/prisma
  /schema.prisma   (generado con db pull)
```

---

## CONFIGURACIÓN DOCKER PARA EASYPANEL

Necesito un Dockerfile y/o docker-compose.yml para poder deployar la webapp como un servicio en Easypanel, en la misma red Docker que PostgreSQL y n8n.

---

## INSTRUCCIONES IMPORTANTES

1. NO crear tablas nuevas. Usar `prisma db pull` para generar el schema desde la base existente.
2. Las tablas `mensajes_consulta` y `archivos_consulta` pueden estar vacías por ahora. Mostrar "Sin mensajes" o "Sin archivos" en la UI cuando no haya datos.
3. Las tablas `planes` y `suscripciones` están vacías. La sección de configuración puede ser un placeholder por ahora.
4. El campo `sintomas` en consultas es JSONB con esta estructura: `{sintomas_actuales: "texto", caracteristicas: {duracion, intensidad, localizacion, evolucion, factores_que_empeoran_o_alivian, sintomas_asociados}}`
5. Cuando el informe tiene estado "enviado", mostrar un botón "Marcar como revisado". Cuando está "revisado", mostrar un check verde.
6. Los campos que tengan NULL mostrarlos como "-" o "No informado" en la UI.
7. Timezone: America/Argentina/Buenos_Aires

---

## IMÁGENES DE REFERENCIA DE DISEÑO

Se adjuntan 2 imágenes de referencia que muestran el estilo visual deseado:

- **referencia_dashboard.png** — Muestra el layout del dashboard: sidebar izquierdo con navegación, cards de métricas arriba (Consultas activas, Nuevos hoy, Casos urgentes), y lista de pacientes recientes estilo WhatsApp con avatar, nombre, teléfono, fecha, badge de estado y flecha de acceso.

- **referencia_detalle_consulta.png** — Muestra el detalle de una consulta con layout de dos columnas: a la izquierda el chat completo con burbujas azules (agente) y grises (paciente) estilo WhatsApp, y a la derecha la ficha clínica con secciones RED FLAGS (fondo rojo claro), motivo de consulta, síntomas, duración, etc.

IMPORTANTE: Seguir este estilo visual como guía principal. El diseño debe verse profesional, limpio y médico, con la misma estructura de componentes que se ve en las referencias.
