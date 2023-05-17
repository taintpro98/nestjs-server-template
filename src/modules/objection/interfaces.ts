import { BaseModel } from './base-model';
import { FetchGraphOptions, PartialModelObject } from 'objection';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RequireWith } from '@validators';
import { ESortBy, MAX_LIMIT_PAGINATION } from './constants';
// import { RequireWith } from '@utils';

export type GenericFunction = (...args: any[]) => any;
export type GenericClass = Record<string, any>;
export type ModelKeys<T extends BaseModel> = PartialModelObject<T> & {
  [key: string]: any;
};

export interface Pagination<T> {
  data: T[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    perPage: number;
    total: number;
  };
}

export interface SortableSchema {
  sort?: string;
}

export interface ObjectionModel {
  $fetchGraph?: GenericFunction;
  $load?(exp: LoadRelSchema): Promise<void>;
}

export interface NestedLoadRelSchema {
  $recursive?: boolean | number;
  $relation?: string;
  $modify?: string[];
  [key: string]:
    | boolean
    | number
    | string
    | string[]
    | NestedLoadRelSchema
    | undefined;
}

export interface LoadRelSchema {
  [key: string]: boolean | NestedLoadRelSchema;
}

export type LoadRelOptions = FetchGraphOptions;

export class BaseFilter {
  @ApiPropertyOptional({
    example: 'id',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @RequireWith(['sort_by'])
  order_by?: string;

  @ApiPropertyOptional({ example: 20, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(MAX_LIMIT_PAGINATION)
  @RequireWith(['page'])
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ example: 1, nullable: true })
  @IsOptional()
  @IsNumber()
  @RequireWith(['limit'])
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    example: 'asc',
    nullable: true,
    enum: Object.values(ESortBy),
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(ESortBy))
  @RequireWith(['order_by'])
  sort_by?: ESortBy;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @RequireWith(['search_text'])
  search_by?: string[];

  @IsOptional()
  @IsString()
  @RequireWith(['search_by'])
  search_text?: string;
}
