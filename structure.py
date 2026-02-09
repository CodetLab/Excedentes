import os

STRUCTURE = [
    "excedentes/docs/invariants",
    "excedentes/docs/algorithms",
    "excedentes/docs/data-model",
    "excedentes/docs/legal",
    "excedentes/docs/diagrams",

    "excedentes/server/src/core/algorithms",
    "excedentes/server/src/core/invariants",
    "excedentes/server/src/core/validators",
    "excedentes/server/src/core/audit",

    "excedentes/server/src/domain",
    "excedentes/server/src/services",
    "excedentes/server/src/api/routes",
    "excedentes/server/src/api/controllers",
    "excedentes/server/src/api/middlewares",

    "excedentes/server/src/models",
    "excedentes/server/src/repositories",
    "excedentes/server/src/utils",
    "excedentes/server/src/config",
    "excedentes/server/tests",

    "excedentes/client/src/app",
    "excedentes/client/src/pages",
    "excedentes/client/src/components",
    "excedentes/client/src/features",
    "excedentes/client/src/services",
    "excedentes/client/src/hooks",
    "excedentes/client/src/store",
    "excedentes/client/src/styles",
    "excedentes/client/public",

    "excedentes/scripts",
]

FILES = [
    "excedentes/server/src/app.js",
    "excedentes/server/src/domain/Company.js",
    "excedentes/server/src/domain/Employee.js",
    "excedentes/server/src/domain/Asset.js",
    "excedentes/server/src/domain/Period.js",
    "excedentes/server/src/services/calculation.service.js",
    "excedentes/server/src/services/certification.service.js",
    "excedentes/.env",
    "excedentes/package.json",
    "excedentes/README.md",
    "excedentes/docker-compose.yml",
]

def main():
    for path in STRUCTURE:
        os.makedirs(path, exist_ok=True)

    for file in FILES:
        if not os.path.exists(file):
            open(file, "w").close()

    print("✅ Estructura creada correctamente.")

if __name__ == "__main__":
    main()
