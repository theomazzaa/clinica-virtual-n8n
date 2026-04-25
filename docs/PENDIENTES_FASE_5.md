# Pendientes para Fase 5

**Propósito**: registrar todas las decisiones, features y mejoras que se postergaron durante la construcción del MVP, para abordarlas en Fase 5 (pulido pre-venta) o post-MVP según corresponda.

**Cómo se usa este archivo**: cada vez que durante una sesión de construcción se decide postergar algo, se agrega acá con suficiente contexto para que en el futuro se entienda por qué se postergó y cómo retomarlo.

---

## Categoría: Manejo de errores y monitoreo

### Error Trigger global

Implementar un workflow separado en n8n llamado "Manejador de errores globales" usando el nodo `Error Trigger`. Cuando cualquier workflow del sistema falla técnicamente (Postgres caído, YCloud rechaza envío, scheduler explota), este workflow recibe la info y notifica por email o WhatsApp al equipo.

### Stop and Error estratégico

Identificar puntos en los flujos donde queremos que la ejecución termine como "fallida" en el log de Executions (en lugar de devolver array vacío silenciosamente). Usar el nodo `Stop and Error` en esos puntos para que se dispare el Error Trigger global.

### Notificación al médico cuando expira un handoff

Cuando se acerca el vencimiento del TTL de 24h del handoff (ej. faltan 2h), enviar un mensaje al médico avisándole que el bot va a retomar la conversación con el paciente. Permite que el médico extienda manualmente si todavía está atendiendo.

---

## Categoría: Escalación y handoff humano

### Comando `/bot` para liberar handoff manualmente

Permitir que el médico, desde su celular, escriba `/bot` en el chat del paciente para forzar la liberación del handoff antes de las 24h. El bot recibe el mensaje, detecta el comando, borra la key `dev:handoff:{telefono}` y retoma el control.

### Sistema completo de escalación a humano

Cuando el bot detecta que un paciente necesita intervención humana (problema con el pago, consulta no resuelta por el flujo, pedido explícito de hablar con persona), debe:

1. Cortar la conversación automatizada.
2. Marcar el caso en BD como "requiere atención" (nueva tabla `eventos_atencion` o columna en `consultas`).
3. Notificar al médico (canal a definir: email, WhatsApp, push).
4. Mostrar el caso en una sección de la app web del médico llamada "Conversaciones que requieren atención".
5. Cuando el médico responde manualmente, el handoff por echo se activa automáticamente.

Casos que disparan escalación:

- Paciente describe síntomas de urgencia (red flags clínicos).
- Paciente pide explícitamente hablar con persona.
- El bot falla técnicamente.
- Paciente envía 3 mensajes consecutivos que el bot no entiende.
- Paciente envía tipos de mensaje no soportados de forma repetida.

### Manejo C de tipos no soportados

Actualmente, cuando llega un audio, imagen, ubicación, etc., el bot responde "no entiendo este formato". En Fase 5, evolucionar a:

- Detectar el tipo no soportado.
- Marcar el caso en BD para revisión del médico.
- Notificar al médico que tiene un mensaje pendiente de revisión humana.

---

## Categoría: Arquitectura multi-médico

### Migración completa a un número de WhatsApp por médico

Ver detalles en `docs/ARQUITECTURA_MULTI_MEDICO.md`.

Tareas concretas en Fase 5:

- Verificar que el flujo maneja correctamente múltiples médicos con números distintos en producción.
- Documentar proceso operativo de onboarding (compra de número en YCloud, verificación Meta Business API, configuración de webhook).
- Definir pricing del plan YCloud según cantidad esperada de números.
- Diseñar flujo de alta de médico nuevo en la app web (formulario que también dispara la creación del setup en YCloud).

### Slug como tracking analytics

El slug queda implementado como metadata opcional. En Fase 5 o post-MVP:

- Construir dashboard de analytics que muestre cantidad de turnos agendados por canal (instagram, google, tarjeta, etc.).
- Permitir al médico crear sus propios slugs personalizados desde la app.

---

## Categoría: Funcionalidades del flujo

### AI Agent fallback para mensajes no esperados

En el Switch principal, cuando un mensaje del paciente no encaja en ninguna rama (estado inesperado, contenido confuso, paciente perdido), routear a un nodo AI Agent que responde amablemente algo como: "por ahora solo puedo ayudarte con agendamiento, ¿querés seguir con eso?". Evita que el bot quede mudo o responda mal.

### Detección de pacientes que cambian de número

Si un paciente conocido (por DNI) escribe desde un número diferente al registrado, detectar y consolidar. Caso borde común que puede generar duplicados en la tabla `pacientes` si no se maneja.

### Validación robusta de formatos

Mejorar validación de DNI (formato argentino), email (regex completo), fecha de nacimiento (parsing flexible). Actualmente las validaciones son básicas.

---

## Categoría: Producto y UX

### Devolución del médico

Construir interfaz en la app web para que el médico, después de la consulta, registre su devolución en `consultas.devolucion_medico`. Campo libre con timestamp de última edición.

### Historia clínica acumulada

Vista en la app web que muestra todas las consultas anteriores de un paciente con ese médico. Aprovecha que `pacientes.celular` ya identifica continuidad. Útil para que el médico vea contexto antes de la nueva consulta.

### Cancelación manual de turnos

Botón "Marcar como cancelado" en el detalle del turno de la app web. Libera el slot. Devolución de dinero queda manual (fuera de la app, vía Mercado Pago directamente).

### Dashboard reformulado

KPIs útiles para el médico:

- Turnos hoy, esta semana, este mes.
- Tiempo ahorrado estimado (vs. atender manualmente).
- Ingresos del mes desglosados por modalidad (privada, OS, OS+copago, pendiente de validar).
- Agenda del día embebida.

### Campos de perfil del médico

Permitir al médico editar desde la app:

- Teléfono del consultorio (se usa en mensajes al paciente).
- Dirección del consultorio (se usa en mensajes al paciente).
- System prompt de la preconsulta (avanzado).
- Modalidades activas y montos.

---

## Categoría: Validación de obras sociales

### Botones de validación de token OS en la app

En el detalle del turno modalidad OS, dos botones: "Marcar como validado" / "Marcar como rechazado". Actualizan `consultas.token_estado`. Manual por ahora, automático en post-MVP cuando se integren APIs de obras sociales.

---

## Categoría: Modelos de IA y costos

### Evaluar upgrade de modelo para preconsulta

Actualmente la preconsulta usa GPT-4 mini o similar. Evaluar migrar a GPT-5 mini (o equivalente vigente al momento) si:

- La calidad del informe clínico mejora notablemente.
- El costo se mantiene dentro del margen del producto.

Hacer A/B con un set de preconsultas reales antes de migrar.

---

## Categoría: Legal y compliance

### Términos y condiciones

Redactar TyC básicos para publicar en la app y aceptar al onboardear cada médico.

### Política de privacidad

Política específica sobre datos médicos sensibles, alineada con Ley 25.326. Aceptación obligatoria del paciente al primer mensaje.

### Disclaimer de urgencias

Verificar que el disclaimer al inicio del flujo cumple con buenas prácticas legales en salud digital. Posiblemente revisar con un abogado especializado.

---

## Categoría: Operativo

### Onboarding documentado

Checklist paso a paso para vos al onboardear un médico nuevo:

1. Crear número en YCloud.
2. Verificar en Meta Business API.
3. Crear fila en BD con datos del médico y su número.
4. Configurar webhook.
5. Ayudar al médico a instalar WhatsApp Business en su celular.
6. Cargar horarios.
7. Conectar Mercado Pago.
8. Test de extremo a extremo.
9. Capacitación 1:1 al médico de cómo usar la app web.

### Limpieza periódica de holds vencidos

Cron job (en n8n) que cada hora marca como `vencido` los holds con `expires_at < now()` y `estado = 'activo'`. Evita acumulación.

### Arreglo del archivo migrations/002

El archivo `migrations/002_ampliar_consultas_y_crear_holds.sql` quedó con el SQL original completo, pero parte se aplicó con un SQL corregido (sin comentarios). Para que la carpeta `migrations/` refleje fielmente lo aplicado, dejar el archivo sincronizado con el SQL real ejecutado.

### Agregar `.gitignore` para archivos auto-generados

Agregar al `.gitignore`:
- `next-env.d.ts`
- `tsconfig.tsbuildinfo`

Son archivos que Next.js y TypeScript regeneran automáticamente y no deberían trackearse en Git.

---

## Cómo procesar este archivo en Fase 5

Cuando llegue Fase 5:

1. Leer este archivo completo.
2. Priorizar items según impacto en venta (qué necesita un médico real para usar el producto sin fricción).
3. Convertir items priorizados en sub-tareas concretas con tiempo estimado.
4. Ejecutar.
5. Items que queden sin hacer pasan a un archivo `PENDIENTES_POST_MVP.md`.