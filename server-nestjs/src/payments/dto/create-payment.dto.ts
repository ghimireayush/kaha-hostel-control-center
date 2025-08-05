import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  UPI = 'upi',
  CHEQUE = 'cheque',
  ONLINE = 'online'
}

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  studentId: string;

  @IsNumber()
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  processedBy?: string;

  @IsOptional()
  @IsString()
  status?: string;

  // For bank transfer/cheque specific fields
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @IsOptional()
  @IsDateString()
  chequeDate?: string;
}

export class InvoiceAllocationDto {
  @IsString()
  invoiceId: string;

  @IsNumber()
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}