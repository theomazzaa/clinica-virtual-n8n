# CLAUDE.md — WEBAPP CLÍNICA VIRTUAL (MediPanel)

## CONTEXTO DEL PROYECTO

Este es un SaaS de clínica virtual llamado MediPanel. Los pacientes se comunican por WhatsApp con un agente de IA que realiza una entrevista clínica completa. Los datos se guardan en una base de datos PostgreSQL ya existente. Esta webapp permite al médico ver toda la información de sus pacientes, consultas e informes desde un dashboard profesional.

## STACK TECNOLÓGICO

- **Framework:** Next.js 14+ (App Router)
- **ORM:** Prisma
- **Base de datos:** PostgreSQL (ya existente con datos reales, NO crear tablas nuevas)
- **Estilos:** Tailwind CSS
- **Autenticación:** NextAuth.js con login por email/password
- **Hosting:** Easypanel (Docker) en VPS

## CONEXIÓN A LA BASE DE DATOS

La base de datos ya existe y tiene datos. Usar Prisma con `db pull` para generar el schema desde la base existente.

```
DATABASE_URL="postgresql://postgres:fc952adf1733c9d91d4b@n8n_postgres:5432/clinica_virtual?sslmode=disable"
```

Nota: `n8n_postgres` es el host interno en la red Docker de Easypanel. Para desarrollo local, cambiar por la IP del servidor: `72.62.140.246`.

## ESTRUCTURA DE LA BASE DE DATOS (8 TABLAS)

### medicos
- id UUID PK
- nombre VARCHAR(100) NOT NULL
- apellido VARCHAR(100) NOT NULL
- matricula_nacional VARCHAR(20) UNIQUE NOT NULL
- especialidad VARCHAR(100)
- email VARCHAR(150) UNIQUE NOT NULL
- telefono VARCHAR(30)
- formacion TEXT
- experiencia TEXT
- zonas_cobertura JSONB DEFAULT '[]' — Array de zonas de atención domiciliaria
- system_prompt TEXT — Prompt del agente IA personalizado
- activo BOOLEAN DEFAULT true
- created_at TIMESTAMP
- updated_at TIMESTAMP

### pacientes
- id UUID PK
- medico_id UUID FK → medicos NOT NULL
- nombre VARCHAR(100) NOT NULL
- apellido VARCHAR(100)
- edad INTEGER
- sexo VARCHAR(20) — masculino/femenino
- fecha_nacimiento DATE
- domicilio TEXT
- dni VARCHAR(15)
- email VARCHAR(150)
- celular VARCHAR(30)
- prepaga VARCHAR(100)
- plan VARCHAR(50)
- credencial VARCHAR(50)
- created_at TIMESTAMP
- updated_at TIMESTAMP
- UNIQUE(medico_id, dni)

### consultas
- id UUID PK
- paciente_id UUID FK → pacientes
- medico_id UUID FK → medicos NOT NULL
- sistema VARCHAR(50) — GASTROINTESTINAL, URINARIO, NEUROLÓGICO, RESPIRATORIO_BAJO, RESPIRATORIO_ALTO, DERMATOLÓGICO, CARDIOVASCULAR, CRONICO_COMPLEJO
- motivo TEXT
- evolucion TEXT
- sintomas JSONB DEFAULT '[]' — Estructura: {sintomas_actuales: "texto", caracteristicas: {duracion, intensidad, localizacion, evolucion, factores_que_empeoran_o_alivian, sintomas_asociados}}
- protocolo JSONB DEFAULT '{}'
- medicacion_habitual TEXT
- alergias TEXT
- alarma BOOLEAN DEFAULT false
- motivo_alarma TEXT
- estado VARCHAR(20) DEFAULT 'en_curso' — en_curso, finalizada, cancelada
- datos_json_completo JSONB
- dentro_cobertura BOOLEAN
- created_at TIMESTAMP
- finalizada_at TIMESTAMP

### mensajes_consulta
- id UUID PK
- consulta_id UUID FK → consultas NOT NULL
- rol VARCHAR(20) NOT NULL — paciente / agente
- contenido TEXT NOT NULL
- orden INTEGER NOT NULL
- created_at TIMESTAMP

### archivos_consulta
- id UUID PK
- consulta_id UUID FK → consultas NOT NULL
- tipo VARCHAR(30) — foto_lesion, foto_garganta, otro
- url TEXT NOT NULL
- nombre_archivo VARCHAR(200)
- created_at TIMESTAMP

### informes
- id UUID PK
- consulta_id UUID FK → consultas UNIQUE NOT NULL — 1 informe por consulta
- google_doc_url TEXT
- google_doc_id VARCHAR(100)
- estado VARCHAR(20) DEFAULT 'generado' — generado, enviado, revisado
- enviado_at TIMESTAMP
- revisado_at TIMESTAMP
- created_at TIMESTAMP

### planes
- id UUID PK
- nombre VARCHAR(50) NOT NULL
- precio_mensual DECIMAL(10,2) NOT NULL
- max_consultas_mes INTEGER — NULL = ilimitado
- descripcion TEXT
- activo BOOLEAN DEFAULT true
- created_at TIMESTAMP

### suscripciones
- id UUID PK
- medico_id UUID FK → medicos NOT NULL
- plan_id UUID FK → planes NOT NULL
- estado VARCHAR(20) DEFAULT 'activa' — activa, pausada, cancelada
- fecha_inicio DATE NOT NULL
- fecha_fin DATE
- fecha_proximo_pago DATE
- created_at TIMESTAMP
- updated_at TIMESTAMP

### RELACIONES
- Un médico tiene muchos pacientes
- Un paciente tiene muchas consultas
- Una consulta tiene muchos mensajes y archivos
- Una consulta tiene un informe
- Un médico tiene una suscripción activa vinculada a un plan

## DATOS EXISTENTES

Médico registrado:
- ID: 48315179-21eb-406d-8c8b-e172d120bdcf
- Nombre: Blas Mazza
- Matrícula: 90883
- Email: blasmazza@yahoo.com

Ya hay pacientes y consultas reales en la base.

## FUNCIONALIDADES DEL MVP

### 1. LOGIN
- Pantalla de login con email y contraseña
- Crear usuario admin con seed para el Dr. Mazza
- Redirigir al dashboard post-login

### 2. DASHBOARD PRINCIPAL
- Cards de métricas: Consultas activas, Nuevos hoy, Casos urgentes (con íconos)
- Sección "Pacientes recientes" con barra de búsqueda
- Lista estilo WhatsApp: avatar circular con inicial, nombre + ícono alerta, teléfono, fecha/hora, badge de estado (Urgente rojo, Completa verde, En curso azul), flecha ">"
- Link "Ver todos" a lista completa

### 3. LISTA DE PACIENTES
- Tabla con: Nombre completo, DNI, Edad, Sexo, Prepaga, Celular, Última consulta, Total consultas
- Búsqueda por nombre, apellido o DNI
- Filtro por prepaga
- Click abre ficha del paciente
- Paginación (10-20 items)

### 4. FICHA DEL PACIENTE
- Datos personales completos
- Historial de consultas ordenado por fecha (más reciente primero)
- Cada consulta: fecha, sistema, motivo, estado, alarma
- Click abre detalle de consulta

### 5. DETALLE DE CONSULTA — LAYOUT DE DOS COLUMNAS

**Header:**
- Nombre completo + badge estado (Urgente/Completa) + ícono alerta
- Teléfono, fecha registro
- Dropdown cambiar estado (arriba derecha)
- Botón volver (←)

**Columna izquierda — Conversación:**
- Título "Conversación" + contador mensajes
- Chat estilo WhatsApp:
  - Agente: burbujas azules (#2563EB), texto blanco
  - Paciente: burbujas grises claras (#F1F5F9)
  - Hora debajo de cada burbuja
  - Scroll vertical
- Si vacío: "Los mensajes de esta consulta no están disponibles aún"

**Columna derecha — Ficha clínica:**
- Título "Ficha clínica" / "Datos de preconsulta"
- RED FLAGS (si alarma=true): card fondo rojo claro (#FEF2F2), borde rojo, ícono ⚠, listado de signos
- MOTIVO DE CONSULTA
- SÍNTOMAS (parseados del JSONB)
- DURACIÓN
- INTENSIDAD
- EVOLUCIÓN
- LOCALIZACIÓN
- FACTORES (empeoran/alivian)
- MEDICACIÓN HABITUAL
- ALERGIAS
- COBERTURA (dentro/fuera + prepaga)
- Botón "Ver informe" (abre Google Doc/PDF)
- Botón "Marcar como revisado" (si estado="enviado", actualiza a "revisado" + revisado_at)

### 6. ALERTAS
- Vista que filtra consultas con alarma = true
- Ordenadas por fecha (más reciente primero)
- Destacadas visualmente en rojo
- Acceso rápido al detalle e informe

## DISEÑO Y UX

### Paleta de colores
- Fondo: blanco / gris muy claro (#F8FAFC)
- Primario: azul médico (#2563EB)
- Alarma/Urgente: rojo (#EF4444), fondo rojo claro (#FEF2F2)
- Completado/Revisado: verde (#22C55E)
- Texto principal: gris oscuro (#1E293B)
- Texto secundario: gris (#64748B)
- Bordes: gris claro (#E2E8F0)

### Componentes
- Sidebar izquierdo fijo, fondo blanco, logo "MediPanel" arriba, navegación con íconos
- Cards con bordes redondeados (rounded-xl), sombras sutiles (shadow-sm)
- Badges de estado: Urgente (bg-red-100 text-red-600), Completa (bg-green-100 text-green-600), En curso (bg-blue-100 text-blue-600)
- Avatares circulares con inicial del nombre, coloreados
- Tipografía: Inter o sistema sans-serif
- Footer sidebar: "MediPanel v1.0"

### Reglas generales
- Responsive: tablet y desktop
- Fechas: dd/mm/aaaa (formato argentino)
- Timezone: America/Argentina/Buenos_Aires
- Idioma: todo en español
- Campos NULL: mostrar "-" o "No informado"
- Loading states y empty states siempre

## ESTRUCTURA DE ARCHIVOS

```
/app
  /login
  /dashboard
  /pacientes
    /[id]
  /consultas
    /[id]
  /alarmas
  /configuracion
/components
  /ui
  /layout
  /dashboard
  /pacientes
  /consultas
/lib
  /prisma.ts
  /auth.ts
/prisma
  /schema.prisma
```

## DOCKER

Incluir Dockerfile para deployar en Easypanel, misma red Docker que PostgreSQL y n8n.

## REGLAS IMPORTANTES

1. NO crear tablas nuevas. Usar `prisma db pull` para generar schema.
2. `mensajes_consulta` y `archivos_consulta` pueden estar vacías. Mostrar placeholder.
3. `planes` y `suscripciones` vacías. Configuración es placeholder por ahora.
4. Campo `sintomas` en consultas es JSONB. Parsear correctamente para mostrar en la ficha.
5. Informe estado "enviado" → botón "Marcar como revisado". Estado "revisado" → check verde.
6. Campos NULL → "-" o "No informado".
7. Ver imágenes de referencia en /docs/referencia_dashboard.png y /docs/referencia_detalle_consulta.png para el estilo visual deseado.