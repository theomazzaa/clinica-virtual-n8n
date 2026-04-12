# PLAN DE BASE DE DATOS — CLÍNICA VIRTUAL SAAS

---

## TABLA 1: medicos
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID, PK | Identificador único |
| nombre | VARCHAR(100) | |
| apellido | VARCHAR(100) | |
| matricula_nacional | VARCHAR(20) | Única |
| especialidad | VARCHAR(100) | |
| email | VARCHAR(150) | Único |
| telefono | VARCHAR(30) | |
| formacion | TEXT | Títulos, posgrados, fellowships |
| experiencia | TEXT | Resumen de trayectoria |
| zonas_cobertura | JSONB | Array de zonas para atención domiciliaria |
| system_prompt | TEXT | Prompt personalizado del agente |
| activo | BOOLEAN | Default true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## TABLA 2: pacientes
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID, PK | |
| medico_id | UUID, FK → medicos | Médico que lo atiende |
| nombre | VARCHAR(100) | |
| apellido | VARCHAR(100) | |
| edad | INTEGER | |
| sexo | VARCHAR(20) | masculino/femenino |
| fecha_nacimiento | DATE | |
| domicilio | TEXT | Dirección completa |
| dni | VARCHAR(15) | Único por médico |
| email | VARCHAR(150) | |
| celular | VARCHAR(30) | |
| prepaga | VARCHAR(100) | |
| plan | VARCHAR(50) | |
| credencial | VARCHAR(50) | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## TABLA 3: consultas
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID, PK | |
| paciente_id | UUID, FK → pacientes | |
| medico_id | UUID, FK → medicos | |
| sistema | VARCHAR(50) | gastrointestinal, urinario, etc. |
| motivo | TEXT | Motivo de consulta textual |
| evolucion | TEXT | |
| sintomas | JSONB | Array de síntomas reportados |
| protocolo | JSONB | Preguntas y respuestas del protocolo |
| medicacion_habitual | TEXT | |
| alergias | TEXT | |
| alarma | BOOLEAN | Default false |
| motivo_alarma | TEXT | Qué disparó la alarma |
| estado | VARCHAR(20) | en_curso, finalizada, cancelada |
| datos_json_completo | JSONB | JSON completo de Redis como respaldo |
| dentro_cobertura | BOOLEAN | Si el domicilio está en zona |
| created_at | TIMESTAMP | Inicio de la consulta |
| finalizada_at | TIMESTAMP | Momento de cierre |

---

## TABLA 4: mensajes_consulta
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID, PK | |
| consulta_id | UUID, FK → consultas | |
| rol | VARCHAR(20) | paciente / agente |
| contenido | TEXT | Texto del mensaje |
| orden | INTEGER | Secuencia del mensaje |
| created_at | TIMESTAMP | |

---

## TABLA 5: archivos_consulta
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID, PK | |
| consulta_id | UUID, FK → consultas | |
| tipo | VARCHAR(30) | foto_lesion, foto_garganta, otro |
| url | TEXT | URL del archivo almacenado |
| nombre_archivo | VARCHAR(200) | |
| created_at | TIMESTAMP | |

---

## TABLA 6: informes
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID, PK | |
| consulta_id | UUID, FK → consultas | Único (1 informe por consulta) |
| google_doc_url | TEXT | URL del documento generado |
| google_doc_id | VARCHAR(100) | ID del doc en Google Drive |
| estado | VARCHAR(20) | generado, enviado, revisado |
| enviado_at | TIMESTAMP | Cuándo se envió al paciente |
| revisado_at | TIMESTAMP | Cuándo el médico lo revisó |
| created_at | TIMESTAMP | |

---

## TABLA 7: planes
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID, PK | |
| nombre | VARCHAR(50) | Básico, Pro, Premium |
| precio_mensual | DECIMAL(10,2) | |
| max_consultas_mes | INTEGER | Null = ilimitado |
| descripcion | TEXT | |
| activo | BOOLEAN | |
| created_at | TIMESTAMP | |

---

## TABLA 8: suscripciones
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID, PK | |
| medico_id | UUID, FK → medicos | |
| plan_id | UUID, FK → planes | |
| estado | VARCHAR(20) | activa, pausada, cancelada |
| fecha_inicio | DATE | |
| fecha_fin | DATE | Null si es recurrente |
| fecha_proximo_pago | DATE | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## RELACIONES CLAVE
- Un **médico** tiene muchos **pacientes**
- Un **paciente** tiene muchas **consultas**
- Una **consulta** tiene muchos **mensajes** y **archivos**
- Una **consulta** tiene un **informe**
- Un **médico** tiene una **suscripción** activa vinculada a un **plan**

---

## NOTAS DE INTEGRACIÓN CON N8N
- **Redis sigue existiendo** para la sesión activa de la entrevista (no cambia nada de lo actual)
- **PostgreSQL se escribe** en momentos clave del flujo: al crear la consulta, al finalizarla, y al generar el informe
- Los nodos de escritura a PostgreSQL se agregan en el flujo principal y en el flujo de informe
