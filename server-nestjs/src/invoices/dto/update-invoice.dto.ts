import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNumber, IsOptional, IsArray, IsDateString, ValidateNested, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateInvoiceDto, CreateInvoiceItemDto } from './create-invoice.dto';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items?: CreateInvoiceItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  total?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  paidAmount?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}