# EXCEDENTES

A docs-first SaaS project with clear separation between documentation and implementation.

## Project Structure

See [STRUCTURE.md](STRUCTURE.md) for the complete directory tree visualization.

### Documentation (docs/)

Organized by priority:

1. **01-core-economic-logic/** - Business rules, pricing models, economic invariants
2. **02-invariants/** - System invariants and validation rules
3. **03-algorithms/** - Algorithm flows and computational logic
4. **04-data-model/** - Entities, relationships, and schemas
5. **05-legal-certification/** - Compliance, audit trails, certifications
6. **06-diagrams/** - Visual documentation (architecture, flows, data)
7. **07-research/** - Market analysis and technical investigations

### Future Implementation (src/)

Clean separation for future code:

- **core/** - Business logic and domain models
- **api/** - Service interfaces and endpoints
- **ui/** - User interface components

## Philosophy

**Documentation First**: All critical business logic, rules, and specifications are documented before implementation. This ensures clarity, facilitates validation, and provides a solid foundation for development.

**Scalable Structure**: Clear boundaries between concerns enable independent evolution of each layer while maintaining system integrity.

## Getting Started

1. Start by reading and completing the documentation in `docs/`
2. Begin with core economic logic and invariants
3. Move through each section systematically
4. Implement code only after documentation is complete and validated