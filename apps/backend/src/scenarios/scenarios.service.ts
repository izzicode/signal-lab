import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from '../metrics/metrics.service';
import { RunScenarioDto, ScenarioType } from './dto/run-scenario.dto';

@Injectable()
export class ScenariosService {
  private readonly logger = new Logger(ScenariosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
  ) {}

  async runScenario(dto: RunScenarioDto) {
    const startTime = Date.now();

    switch (dto.type) {
      case 'success':
        return this.handleSuccess(dto, startTime);
      case 'validation_error':
        return this.handleValidationError(dto);
      case 'system_error':
        return this.handleSystemError(dto, startTime);
      case 'slow_request':
        return this.handleSlowRequest(dto, startTime);
      case 'teapot':
        return this.handleTeapot(dto, startTime);
      default:
        throw new BadRequestException(`Unknown scenario type: ${dto.type}`);
    }
  }

  private async handleSuccess(dto: RunScenarioDto, startTime: number) {
    const duration = Date.now() - startTime;

    const run = await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        status: 'completed',
        duration,
        metadata: dto.name ? { name: dto.name } : undefined,
      },
    });

    this.metrics.scenarioRunsTotal.inc({ type: dto.type, status: 'completed' });
    this.metrics.scenarioRunDuration.observe(
      { type: dto.type },
      duration / 1000,
    );

    this.logger.log({
      message: 'Scenario completed successfully',
      scenarioType: dto.type,
      scenarioId: run.id,
      duration,
    });

    return { id: run.id, status: 'completed', duration };
  }

  private handleValidationError(dto: RunScenarioDto) {
    Sentry.addBreadcrumb({
      category: 'scenario',
      message: 'Validation error scenario triggered',
      level: 'warning',
      data: { type: dto.type, name: dto.name },
    });

    this.metrics.scenarioRunsTotal.inc({
      type: dto.type,
      status: 'validation_error',
    });

    this.logger.warn({
      message: 'Scenario rejected: validation error',
      scenarioType: dto.type,
    });

    throw new BadRequestException(
      'Validation failed: scenario rejected by business rules',
    );
  }

  private async handleSystemError(dto: RunScenarioDto, startTime: number) {
    const duration = Date.now() - startTime;

    const run = await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        status: 'error',
        duration,
        error: 'Simulated system error',
        metadata: dto.name ? { name: dto.name } : undefined,
      },
    });

    this.metrics.scenarioRunsTotal.inc({ type: dto.type, status: 'error' });

    this.logger.error({
      message: 'Scenario failed with system error',
      scenarioType: dto.type,
      scenarioId: run.id,
      duration,
      error: 'Simulated system error',
    });

    throw new InternalServerErrorException(
      'Simulated system error: unhandled exception in scenario processing',
    );
  }

  private async handleSlowRequest(dto: RunScenarioDto, startTime: number) {
    const delay = Math.floor(Math.random() * 3000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const duration = Date.now() - startTime;

    const run = await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        status: 'completed',
        duration,
        metadata: dto.name ? { name: dto.name, delay } : { delay },
      },
    });

    this.metrics.scenarioRunsTotal.inc({ type: dto.type, status: 'completed' });
    this.metrics.scenarioRunDuration.observe(
      { type: dto.type },
      duration / 1000,
    );

    this.logger.warn({
      message: 'Slow scenario completed',
      scenarioType: dto.type,
      scenarioId: run.id,
      duration,
      delay,
    });

    return { id: run.id, status: 'completed', duration };
  }

  private async handleTeapot(dto: RunScenarioDto, startTime: number) {
    const duration = Date.now() - startTime;

    const run = await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        status: 'completed',
        duration,
        metadata: { easter: true, name: dto.name },
      },
    });

    this.metrics.scenarioRunsTotal.inc({ type: dto.type, status: 'teapot' });
    this.metrics.scenarioRunDuration.observe(
      { type: dto.type },
      duration / 1000,
    );

    this.logger.log({
      message: "I'm a teapot",
      scenarioType: dto.type,
      scenarioId: run.id,
      signal: 42,
    });

    throw new HttpException(
      { signal: 42, message: "I'm a teapot", id: run.id },
      HttpStatus.I_AM_A_TEAPOT,
    );
  }

  async getRecentRuns(limit = 20) {
    return this.prisma.scenarioRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
