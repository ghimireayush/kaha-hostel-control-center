import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsObject, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateRoomDto } from './create-room.dto';
import { RoomStatus } from '../entities/room.entity';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  roomNumber?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  type?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  @Transform(({ value }) => parseInt(value))
  bedCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  occupancy?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  gender?: string;

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
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastCleaned?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  maintenanceStatus?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;
}