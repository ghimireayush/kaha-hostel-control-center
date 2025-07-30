import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ReportType } from '../entities/report.entity';

export class GenerateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsOptional()
  @IsObject()
  parameters?: any;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  generatedBy?: string;
}