import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreatePaymentDto } from './create-payment.dto';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  reference?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  transactionId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  bankName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  chequeNumber?: string;

  @IsOptional()
  @IsDateString()
  chequeDate?: string;
}