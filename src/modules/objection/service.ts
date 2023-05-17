import { Inject, Injectable } from '@nestjs/common';
import { BaseModel } from './base-model';
import { SquareboatNestObjection } from './constants';
import { DatabaseOptions } from './options';
import Knex, { Knex as KnexType } from 'knex';
import { ConnectionNotFound } from './exceptions';
import KnexLogger from './knex-logging';

@Injectable()
export class ObjectionService {
  static config: DatabaseOptions;
  static dbConnections: Record<string, KnexType>;

  constructor(
    @Inject(SquareboatNestObjection.databaseOptions) config: DatabaseOptions,
  ) {
    const defaultConnection = config.connections[config.default];
    ObjectionService.config = config;
    ObjectionService.dbConnections = {};
    const defaultKnex = Knex(defaultConnection);
    BaseModel.knex(
      process.env.DB_DEBUG ? KnexLogger(defaultKnex) : defaultKnex,
    );
    for (const conName in config.connections) {
      ObjectionService.dbConnections[conName] = Knex(
        config.connections[conName],
      );
      if (process.env.DB_DEBUG) {
        ObjectionService.dbConnections[conName] = KnexLogger(
          ObjectionService.dbConnections[conName],
        );
      }
    }
  }

  static connection(conName?: string): KnexType {
    // check if conName is a valid connection name
    conName = conName || ObjectionService.config.default;

    const isConNameValid = Object.keys(
      ObjectionService.config.connections,
    ).includes(conName);

    if (conName && !isConNameValid) {
      throw new ConnectionNotFound(conName);
    }

    return ObjectionService.dbConnections[
      conName ? conName : ObjectionService.config.default
    ];
  }

  static connectionConfig(config: DatabaseOptions, conName?: string): KnexType {
    // check if conName is a valid connection name
    conName = conName || config.default;

    const isConNameValid = Object.keys(config.connections).includes(conName);

    if (conName && !isConNameValid) {
      throw new ConnectionNotFound(conName);
    }
    const connection = Knex(
      config.connections[conName ? conName : config.default],
    );

    return process.env.DB_DEBUG ? KnexLogger(connection) : connection;
  }
}
