Clean ARCHITECTURE





        Cliente (Frontend / App)
                ↓
        Controller (HTTP layer)
                ↓
        Service (Business Logic)
                ↓
        Repository (Data Access)
                ↓
             Database



--------------------------------------



[ HTTP Request ]
        ↓
┌──────────────────────┐
│     Controller       │
│ - Recibe request     │
│ - Valida formato     │
│ - Llama al service   │
└──────────────────────┘
        ↓
┌──────────────────────┐
│       Service        │
│ - Reglas negocio     │
│ - Validaciones lógicas
│ - Orquesta repos     │
│ - Usa utils          │
└──────────────────────┘
        ↓
┌──────────────────────┐
│     Repository       │
│ - Queries DB         │
│ - ORM                │
│ - CRUD               │
└──────────────────────┘
        ↓
┌──────────────────────┐
│      Database        │
└──────────────────────┘




--------------------------------

                    ┌──────────────┐
                    │   Utils      │
                    │ Hash, JWT,   │
                    │ Formatters   │
                    └──────▲───────┘
                           │
                        Cliente
                        ↓
                        Controller
                        ↓
                        Service ─────────────→ External APIs (Stripe, AWS, etc)
                        ↓
                        Repository
                        ↓
                        Database


----------------------------------------------
Controller → Service → Repository
