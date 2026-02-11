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




## Convención de Commits (simplificada)

Formato:

```
type(scope): short description
```

### Tipos permitidos

* **feat** → nueva funcionalidad
* **chore** → setup, tooling, limpieza
* **docs** → documentación
* **fix** → corrección de bug
* **refactor** — cambio interno sin alterar funcionalidad

### Reglas

* 1 commit = 1 idea técnica
* Mensajes claros, sin épica
* El valor se comunica en la release, no en el commit

### Ejemplos

```
feat(audio): scan device storage for mp3 files
feat(audio): read basic mp3 metadata
feat(ui): render song list
chore(project): adjust expo config
fix(audio): handle missing metadata gracefully
refactor(audio): simplify metadata parser
```


## Estandares:

* **commit** → Estandarizamos commits con el fin de entender los avances y la entrega de calidad constante en caso de algun error, volvemos y revertimos commit

* **clean architecture** → Estandarizamos nuestra estructura del back end alineandonos con la clean architecture y manejar mejor los servicios del backend buscando escalabilidad para implementar features rapidamente.