import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  quantity?: number = 1;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  category?: string;
}

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  studentId: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  month: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  total?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  paidAmount?: number = 0;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  status?: string = 'pending';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  createdBy?: string;
}