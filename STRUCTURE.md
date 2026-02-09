# EXCEDENTES - Project Structure

A docs-first SaaS project structure for EXCEDENTES.

```
excedentes/
├── docs/
│   ├── 01-core-economic-logic/
│   │   ├── README.md
│   │   ├── business-rules.md
│   │   ├── pricing-models.md
│   │   └── economic-invariants.md
│   ├── 02-invariants/
│   │   ├── README.md
│   │   ├── system-invariants.md
│   │   └── validation-rules.md
│   ├── 03-algorithms/
│   │   ├── README.md
│   │   ├── flow-diagrams.md
│   │   └── computational-logic.md
│   ├── 04-data-model/
│   │   ├── README.md
│   │   ├── entities.md
│   │   ├── relationships.md
│   │   └── schemas.md
│   ├── 05-legal-certification/
│   │   ├── README.md
│   │   ├── compliance.md
│   │   ├── audit-trail.md
│   │   └── certifications.md
│   ├── 06-diagrams/
│   │   ├── README.md
│   │   ├── architecture/
│   │   ├── flows/
│   │   └── data/
│   └── 07-research/
│       ├── README.md
│       ├── market-analysis.md
│       └── technical-investigations.md
├── src/
│   ├── core/
│   │   └── README.md
│   ├── api/
│   │   └── README.md
│   └── ui/
│       └── README.md
└── README.md
```

## Structure Philosophy

### Documentation First (docs/)
All critical business logic, rules, and specifications live in documentation before code.

### Future Code Separation (src/)
Clean separation between:
- **core**: Business logic and domain models
- **api**: Service interfaces and endpoints
- **ui**: User interface components

This structure ensures scalability and maintains clear boundaries between concerns.
