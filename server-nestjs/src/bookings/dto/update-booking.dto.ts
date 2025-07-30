import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateBookingDto } from './create-booking.dto';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

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
  checkInDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  @Transform(({ value }) => parseInt(value))
  duration?: number;

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
}