# Arquitectura Multi-Médico

**Fecha de decisión**: 24 de abril de 2026
**Estado**: Decidida, pendiente de implementación gradual hasta Fase 5

## Decisión tomada

**Cada médico tiene su propio número de WhatsApp.** La identificación del médico en el flujo de agendamiento se realiza por el número al que el paciente escribe (`to` del webhook de YCloud), no por un slug en el texto del mensaje.

## Por qué esta decisión

### Privacidad y regulación

Un médico que usa DocAgent necesita abrir su WhatsApp Business en su celular y ver únicamente las conversaciones de sus propios pacientes. Si varios médicos comparten un número, cualquier médico vería los chats de los otros, lo cual viola:

- Secreto médico profesional.
- Ley 25.326 de Protección de Datos Personales (Argentina).
- Equivalentes internacionales (HIPAA, GDPR) si se expande a otros mercados.

### Autonomía del médico

El médico quiere responder manualmente a sus pacientes desde su celular cuando haga falta (handoff por echo). Con número compartido, esto es imposible sin construir una interfaz de chat web dedicada (trabajo significativo que no agrega valor).

### Branding del médico

El número asignado al médico aparece en sus tarjetas, Instagram, Google My Business, WhatsApp del consultorio. Es un activo del médico, no un número compartido diluido entre varios profesionales.

### Escalabilidad comercial

Cuando un médico recomienda DocAgent a un colega, puede decir "mi número es este, es exclusivo mío". Eso posiciona al producto como premium. Un modelo de número compartido es percibido como low-cost y genera objeciones de venta.

## Implicancias técnicas

### Base de datos

Nueva columna en `medicos`:

telefono_whatsapp varchar(30) UNIQUE NOT NULL

Es el número asignado a ese médico en YCloud.

### Identificación del médico en el flujo

Cuando llega un mensaje al webhook, el `to` (número destinatario del mensaje) corresponde a un único médico. El flujo busca al médico con:

SELECT * FROM medicos WHERE telefono_whatsapp = :to_del_webhook;

El slug deja de ser necesario para identificación. Queda disponible como metadata opcional de tracking (ej. `turno-instagram` para saber de qué canal vino el paciente).

### Nodo `parse message`

El output del nodo debe incluir un nuevo campo:

telefono_destinatario: string  // el "to" del webhook

El slug se mantiene en el output pero solo con fines informativos.

## Implicancias operativas

### Costo por médico

Cada médico requiere un número de WhatsApp en YCloud. Costo aproximado USD 5-15/mes por número. Se absorbe en el pricing del producto.

### Onboarding de un médico nuevo

1. Compra o asignación del número en YCloud.
2. Verificación del número en Meta Business API (1-3 días).
3. Creación de la fila del médico en `medicos` con el `telefono_whatsapp`.
4. Configuración del webhook del número hacia el workflow de DocAgent.
5. El médico instala WhatsApp Business en su celular con ese número.

### Modo producción

El flujo usa el mismo workflow de n8n para todos los médicos. El lookup por `telefono_destinatario` rutea automáticamente al médico correcto. No se necesitan workflows separados por médico.

## Alcance de implementación

### Fase 1-4 (construcción y testing del MVP)

- Un solo médico real: Theo (`drtheomazza`), con número `+5491176102312`.
- Columna `telefono_whatsapp` agregada desde ahora.
- Código del flujo ya implementa lookup por número.
- Arquitectura correcta desde el inicio aunque haya un solo médico.

### Fase 5 (pulido pre-venta)

- Verificar que el flujo maneja correctamente múltiples médicos con números distintos.
- Documentar proceso de onboarding operativo.
- Ajustar pricing de YCloud según cantidad esperada de números.

### Post-MVP

- Cada nuevo médico que se suma trae su propio número.
- No hay trabajo técnico adicional por cada nuevo médico (el código ya está preparado).

## Decisión sobre el slug

**El slug se mantiene como campo opcional para tracking analytics.**

- Columna `medicos.slug` sigue existiendo.
- No es NOT NULL ni UNIQUE.
- Si un médico quiere rastrear de qué canal vino cada paciente, puede usar links distintos:
  - `wa.me/+549XXX?text=turno-instagram`
  - `wa.me/+549XXX?text=turno-googlemaps`
  - `wa.me/+549XXX?text=turno-tarjeta`
- El nodo `parse message` detecta y guarda el slug del texto, pero no se usa para identificar al médico.
- Analytics futuros pueden agregar estadísticas por canal.

## Alternativas consideradas y descartadas

### Número único compartido entre varios médicos

**Descartada** por:
- Imposibilidad de handoff manual sin construir interfaz de chat web.
- Problemas de privacidad y compliance.
- Debilita propuesta de valor comercial.

### Híbrido (bot genérico + WhatsApp personal del médico)

**Descartada** por:
- El paciente termina con dos contactos (bot + médico).
- Complejidad operativa.
- Mezcla de conversaciones difícil de debuggear.