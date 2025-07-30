import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateDiscountDto } from './create-discount.dto';
import { DiscountStatus } from '../entities/discount.entity';

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  amount?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  reason?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @IsOptional()
  @IsEnum(DiscountStatus)
  status?: DiscountStatus;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;
}