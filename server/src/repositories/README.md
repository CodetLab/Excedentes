# Repositories

Esta carpeta contiene los repositorios que **desacoplan** el motor de cálculo económico de la infraestructura de base de datos (MongoDB).

## Principio

El Core Engine (`core/orchestrator.ts`) es una función **pura** que recibe datos y devuelve resultados. Los repositorios se encargan de:

1. **Obtener datos** de MongoDB
2. **Transformar** al formato que espera el motor
3. **Persistir** los resultados del cálculo

## Repositorios

- `company.repository.js` - Gestión de empresas
- `employee.repository.js` - Gestión de empleados
- `asset.repository.js` - Gestión de activos
- `period.repository.js` - Gestión de períodos económicos

## Uso típico

```javascript
import employeeRepository from './repositories/employee.repository.js';
import periodRepository from './repositories/period.repository.js';
import { runExcedentesEngine } from './core/orchestrator.js';

// 1. Obtener datos del período
const periodData = await periodRepository.getForCalculation(periodId);

// 2. Obtener empleados para el cálculo
const employees = await employeeRepository.getForCalculation(companyId);

// 3. Ejecutar motor puro
const result = runExcedentesEngine({
  ...periodData,
  employees,
});

// 4. Guardar resultado
await periodRepository.saveCalculationResult(periodId, result);
```

## Beneficios

- El motor puede testearse sin base de datos
- Fácil migración a otra DB
- Separación clara de responsabilidades
