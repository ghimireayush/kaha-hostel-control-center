import { IsString, IsOptional, IsEmail, IsDateString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus } from '../entities/booking-request.entity';

export class CreateBookingDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  phone: string;

  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  guardianName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  guardianPhone?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  preferredRoom?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  course?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  institution?: string;

  @IsOptional()
  @IsDateString()
  requestDate?: string;

  @IsOptional()
  @IsDateString()
  checkInDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  @Transform(({ value }) => parseInt(value))
  duration?: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  address?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  idProofType?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  idProofNumber?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  source?: string = 'website';
}