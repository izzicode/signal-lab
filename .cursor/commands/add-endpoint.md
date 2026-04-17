# /add-endpoint

Scaffold a new NestJS endpoint in Signal Lab with full observability.

## Usage
```
/add-endpoint <domain> <method> <path>
```

Example: `/add-endpoint alerts POST /api/alerts`

## What this command does

1. Read the `nestjs-endpoint-skill` skill for scaffolding pattern
2. Read the `observability-skill` skill for instrumentation pattern
3. Read `apps/backend/src/scenarios/` as reference implementation
4. Create the following files:
   - `apps/backend/src/<domain>/dto/<action>-<domain>.dto.ts`
   - `apps/backend/src/<domain>/<domain>.service.ts`
   - `apps/backend/src/<domain>/<domain>.controller.ts`
   - `apps/backend/src/<domain>/<domain>.module.ts`
5. Register the module in `apps/backend/src/app.module.ts`
6. Add Prisma model to `prisma/schema.prisma` if persistence is needed
7. Wire metrics: counter increment + histogram observe
8. Wire logging: structured log with relevant context fields
9. Verify Swagger annotation on all endpoints
10. Report: list created files + remind to run `npx prisma migrate dev`

## Checklist before completing
- [ ] DTO uses class-validator + @ApiProperty
- [ ] Service injects PrismaService and MetricsService
- [ ] Controller has @ApiTags + @ApiOperation + @ApiResponse
- [ ] Module imports MetricsModule
- [ ] Module registered in AppModule
- [ ] Metrics: counter + histogram
- [ ] Logging: info on success, error on failure
