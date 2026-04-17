import {
  Controller,
  Post,
  Get,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ScenariosService } from './scenarios.service';
import { RunScenarioDto } from './dto/run-scenario.dto';

@ApiTags('scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Post('run')
  @ApiOperation({ summary: 'Run a scenario' })
  @ApiResponse({ status: 200, description: 'Scenario completed' })
  @ApiResponse({ status: 400, description: 'Validation error scenario' })
  @ApiResponse({ status: 418, description: "I'm a teapot (easter egg)" })
  @ApiResponse({ status: 500, description: 'System error scenario' })
  async runScenario(@Body() dto: RunScenarioDto) {
    return this.scenariosService.runScenario(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get recent scenario runs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentRuns(@Query('limit') limit?: string) {
    return this.scenariosService.getRecentRuns(
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
