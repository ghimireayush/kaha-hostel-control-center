import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class InvoiceAllocationDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  invoiceId: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  notes?: string;
}

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  studentId: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

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
  receiptNumber?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  processedBy?: string;

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  invoiceIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceAllocationDto)
  invoiceAllocations?: InvoiceAllocationDto[];
}