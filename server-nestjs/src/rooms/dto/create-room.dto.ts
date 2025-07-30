import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsObject, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { RoomStatus } from '../entities/room.entity';

export class CreateRoomDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  roomNumber: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  type?: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  @Transform(({ value }) => parseInt(value))
  bedCount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  occupancy?: number = 0;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  gender?: string = 'Any';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  monthlyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  dailyRate?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => Array.isArray(value) ? value.map(v => v?.trim()) : [])
  amenities?: string[];

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @IsOptional()
  @IsObject()
  layout?: any;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  floor?: string;

  @IsOptional()
  @IsArray()
  occupants?: any[];

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastCleaned?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  maintenanceStatus?: string = 'Good';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  pricingModel?: string = 'monthly';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;
}