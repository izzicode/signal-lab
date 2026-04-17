import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type ScenarioType =
  | 'success'
  | 'validation_error'
  | 'system_error'
  | 'slow_request'
  | 'teapot';

export class RunScenarioDto {
  @ApiProperty({
    description: 'Scenario type to run',
    enum: ['success', 'validation_error', 'system_error', 'slow_request', 'teapot'],
    example: 'success',
  })
  @IsString()
  @IsIn(['success', 'validation_error', 'system_error', 'slow_request', 'teapot'])
  type!: ScenarioType;

  @ApiPropertyOptional({ description: 'Optional run name', example: 'My test run' })
  @IsOptional()
  @IsString()
  name?: string;
}
