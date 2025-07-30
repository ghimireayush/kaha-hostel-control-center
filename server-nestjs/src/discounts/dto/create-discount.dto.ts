import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { DiscountStatus } from '../entities/discount.entity';

export class CreateDiscountDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  studentId: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  discountType?: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsString()
  @Transform(({ value }) => value?.trim())
  reason: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  appliedBy?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(DiscountStatus)
  status?: DiscountStatus;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  appliedTo?: string = 'ledger';

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPercentage?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  percentageValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  maxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  baseAmount?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  referenceId?: string;
}