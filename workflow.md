# Development & Versioning Workflow

Este documento define **cómo vamos a trabajar** durante el desarrollo del proyecto.  
El objetivo es mantener foco en valor, claridad técnica y un historial limpio.

No es burocracia: es una forma de reducir fricción y escalar mejor.

---

## Objetivos

- Entregar **valor identificable** en cada versión
- Separar experimentación de entregas estables
- Mantener un historial de Git claro y profesional
- Evitar deuda técnica innecesaria

---

## Principios

1. **Las releases entregan valor**
   Cada versión debe poder explicarse en una frase clara.

2. **Los commits describen cambios técnicos**
   El “por qué” vive en la release, el “cómo” en el commit.

3. **La experimentación es válida**
   El desorden vive fuera de `main`.

4. **El historial importa**
   Git es una herramienta de comunicación, no solo de backup.

---

## Branching

### Branch principal

- `main` representa el estado **estable** del proyecto
- Solo recibe código que:
  - Compila
  - Es entendible
  - Aporta valor claro

### Branches de versión

Cada feature o mejora significativa vive en su propio branch:

```bash
git checkout -b v0.x
```

## Cuando una rama es estable se hace un Pull Request y se elimina
