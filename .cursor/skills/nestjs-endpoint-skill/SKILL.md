---
name: nestjs-endpoint-skill
description: Scaffold a complete NestJS endpoint in Signal Lab with DTO validation, service method, Swagger docs, and observability wired up. Use when adding a new API endpoint, new domain module, or new route to the backend.
---

# NestJS Endpoint Skill

Scaffold a complete endpoint following Signal Lab conventions.

## When to Use
- Adding a new route to the backend
- Creating a new feature module
- Asked to "add endpoint", "create API", "add route"

## Checklist
- [ ] DTO with class-validator decorators and Swagger `@ApiProperty`
- [ ] Controller with `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- [ ] Service with injected `PrismaService` and `MetricsService`
- [ ] Module registered in `AppModule`
- [ ] Observability added (see observability-skill)

## Step 1 — DTO

```typescript
// src/<domain>/dto/create-<domain>.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateThingDto {
  @ApiProperty({ example: 'value' })
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
```

## Step 2 — Service

```typescript
@Injectable()
export class ThingsService {
  private readonly logger = new Logger(ThingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
  ) {}

  async create(dto: CreateThingDto) {
    const start = Date.now();
    const result = await this.prisma.thing.create({ data: dto });
    const duration = Date.now() - start;

    this.logger.log({ message: 'Thing created', id: result.id, duration });
    // Add metric increment here — see observability-skill
    return result;
  }
}
```

## Step 3 — Controller

```typescript
@ApiTags('things')
@Controller('things')
export class ThingsController {
  constructor(private readonly thingsService: ThingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a thing' })
  @ApiResponse({ status: 201, description: 'Created' })
  create(@Body() dto: CreateThingDto) {
    return this.thingsService.create(dto);
  }
}
```

## Step 4 — Module

```typescript
@Module({
  imports: [MetricsModule],
  controllers: [ThingsController],
  providers: [ThingsService],
})
export class ThingsModule {}
```

Register in `AppModule` imports array.

## Step 5 — Prisma Schema (if new model needed)

Add model to `prisma/schema.prisma`, then:
```bash
npx prisma migrate dev --name add-things
```
