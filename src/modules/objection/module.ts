import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { SquareboatNestObjection } from './constants';
import {
  DatabaseAsyncOptions,
  DatabaseAsyncOptionsFactory,
  DatabaseOptions,
} from './options';
import { ObjectionService } from './service';
import { DbOperationsCommand } from './commands/migrations';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class ObjectionModule {
  /**
   * Register options
   * @param options
   */
  static register(options: DatabaseOptions): DynamicModule {
    return {
      global: options.isGlobal || false,
      module: ObjectionModule,
      imports: [DiscoveryModule],
      providers: [
        ObjectionService,
        DbOperationsCommand,
        { provide: SquareboatNestObjection.databaseOptions, useValue: options },
        {
          provide: 'DB_CONNECTION',
          useFactory: () => {
            return ObjectionService.connectionConfig(options, options.default);
          },
        },
      ],
      exports: ['DB_CONNECTION'],
    };
  }

  /**
   * Register Async Options
   */
  static registerAsync(options: DatabaseAsyncOptions): DynamicModule {
    return {
      global: options.isGlobal || false,
      module: ObjectionModule,
      imports: [DiscoveryModule],
      providers: [
        ...this.createOptionsProvider(options),
        ObjectionService,
        DbOperationsCommand,
      ],
      exports: ['DB_CONNECTION'],
    };
  }

  private static createOptionsProvider(
    options: DatabaseAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: SquareboatNestObjection.databaseOptions,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: 'DB_CONNECTION',
          useFactory: async (inject: any[]) => {
            const databaseOptions = await options.useFactory(inject);
            return ObjectionService.connectionConfig(
              databaseOptions,
              databaseOptions.default,
            );
          },
          inject: options.inject || [],
        },
      ];
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<DatabaseOptions>,
    ];

    return [
      {
        provide: SquareboatNestObjection.databaseOptions,
        useFactory: async (optionsFactory: DatabaseAsyncOptionsFactory) =>
          await optionsFactory.createOptions(),
        inject,
      },
      {
        provide: 'DB_CONNECTION',
        useFactory: async (optionsFactory: DatabaseAsyncOptionsFactory) => {
          const options = await optionsFactory.createOptions();
          return ObjectionService.connectionConfig(options, options.default);
        },
        inject,
      },
    ];
  }
}
