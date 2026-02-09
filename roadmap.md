📦 v0.0.1 — Economic Core Spec (LOCKED)
Rol
Congelar la verdad económica del sistema.
Alcance
❌ Nada de código productivo
❌ Nada de UI
✔ Documentación fundacional
Incluye
Invariantes económicas formales
Algoritmos core definidos (break-even, excedente, reparto)
Modelo de datos mínimo
Flowchart completo del motor
Outputs certificables definidos

📌 Valor
El sistema existe antes de ser programado.
No hay ambigüedad futura.

🔵 v0.0.2 — Core Engine Determinista
Objetivo

Que EXCEDENTES calcule bien, sin DB ni API.

Core
Implementación del motor económico puro
Auditoría matemática automática
Manejo de errores económicos (no técnicos)
Tests de caja negra por algoritmo
Infra
Repo MERN estructurado
Scripts de test
CI básico local

📌 Valor
Si esto funciona, todo lo demás es envoltorio.

🟢 v0.0.3 — Persistence & API Surface
Objetivo

Hacer el motor usable por sistemas externos.

Backend

MongoDB setup

Modelos Mongoose (Company, Employee, Asset, Period)

Repositories desacoplados

Servicios de orquestación

API

Endpoint /calculate

Validación estricta de inputs

Respuesta estructurada y auditada

📌 Valor
El core se vuelve consumible y reutilizable.

🟡 v0.0.4 — Auth & System Access
Objetivo

Controlar quién calcula qué.

Seguridad

Autenticación básica (JWT)

Roles iniciales (admin / empresa)

Protección de endpoints

Frontend (mínimo)

Setup React

Pantalla de Login

Layout base (shell)

📌 Valor
Sistema cerrable, no un script suelto.

🟠 v0.0.5 — Economic Visibility (UI Core)
Objetivo

Hacer visible el valor económico.

UI

Formulario de carga de datos

Ejecución de cálculo

Visualización:

Punto de equilibrio

Excedente total

Capital vs Trabajo

UX

Estados claros (sin ganancia, error, éxito)

Mensajes explicativos

📌 Valor
La empresa ve lo que antes estaba oculto.

🔴 v0.0.6 — Labor Distribution & Transparency
Objetivo

Cerrar el loop con el trabajador.

Core

Algoritmo de asignación interna al personal

Soporte de reglas configurables

UI

Tabla de distribución por empleado

Trazabilidad del cálculo

Vista “empleado”

📌 Valor
Motivación endógena real, no discursiva.

🟣 v0.0.7 — Certification & Legal Artifact
Objetivo

Convertir cálculo en documento defendible.

Certificación

Generación de certificado (PDF/JSON)

Hash verificable del período

Historial de certificados

Auditoría

Inputs firmados

Resultados congelados

Reproducibilidad total

📌 Valor
EXCEDENTES pasa de app a infraestructura legal-tech.