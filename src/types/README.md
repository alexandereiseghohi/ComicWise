# Types and DTOs

This folder contains canonical TypeScript types and Data Transfer Objects (DTOs) used across the workspace.

Conventions
- DTOs follow a DRF-like naming pattern: `EntityCreateDTO`, `EntityUpdateDTO`, `EntityReadDTO`.
- Runtime Zod schemas live in `src/lib/validations` and should export `z.infer` derived types when appropriate.
- Import types from the single barrel `src/types` to avoid duplicated type definitions.

Adding a new model
1. Add DTOs to `src/types/dtos/<model>.dto.ts`.
2. Export the DTOs from `src/types/index.ts`.
3. If you add or update a Zod schema, ensure `src/lib/validations/index.ts` re-exports it and add `export type <Model>DTO = z.infer<typeof schema>` if helpful.

Testing
- Add a unit test in `tests/types.spec.ts` to validate parity between DTOs and Zod schemas for critical models.
