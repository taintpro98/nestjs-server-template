import { BaseModel } from '../base-model';
import { CustomQueryBuilder } from '../queryBuilder';
import { BaseFilter, ModelKeys } from '../interfaces';
import {
  AnyQueryBuilder,
  Expression,
  MaybeCompositeId,
  PrimitiveValue,
  Transaction,
} from 'objection';
import { ObjectionService } from '../service';
import { Knex as KnexType } from 'knex';
import { ModelNotFound } from '../exceptions';
import { IRepository } from './repository.interface';
import { ESortBy } from '../constants';
import { getRelationsFromIncludes } from '../helpers';

export class Repository<T extends BaseModel> implements IRepository<T> {
  model: any;
  knexConnection: KnexType | null = null;

  static queryFilter(query: AnyQueryBuilder, filter?: any): AnyQueryBuilder {
    if (filter?.order_by) {
      if (filter.sort_by && filter.sort_by === ESortBy.ASC) {
        query = query.orderByRaw(`${filter.order_by} ASC`);
      } else {
        query = query.orderByRaw(`${filter.order_by} DESC`);
      }
    }

    if (filter?.limit && filter?.page) {
      query = query.limit(filter.limit);
      query = query.offset(filter.limit * (filter.page - 1));
    }
    return this.extendQueryFilter(query, filter);
  }

  static extendQueryFilter(
    query: AnyQueryBuilder,
    filter: any,
  ): AnyQueryBuilder {
    return query;
  }

  public bindCon(conName?: string): Repository<T> {
    const newRepository = new (<any>this.constructor)() as Repository<T>;

    const connection = ObjectionService.connection(
      conName || this.model.connection,
    );
    newRepository.knexConnection = connection;

    return newRepository;
  }

  setModel(model: T): this {
    this.model = model;
    return this;
  }

  /**
   * Get all rows
   */
  async all(): Promise<T[]> {
    return this.query() as unknown as Promise<T[]>;
  }

  /**
   * Get first instance with the matching criterias
   * @param inputs
   * @param error
   */
  async firstWhere(inputs: ModelKeys<T>, error = true): Promise<T | undefined> {
    // inputs = inputs || {};
    const query = this.query<T>();

    const model = await query.findOne(inputs);
    if (error && !model) this.raiseError();

    return model;
  }

  /**
   * Get all instances with the matching criterias
   * @param inputs
   * @param error
   */
  async getWhere(inputs: ModelKeys<T>, error = true): Promise<T[]> {
    const query = this.query<T[]>();

    for (const key in inputs) {
      Array.isArray(inputs[key] as unknown as any)
        ? query.whereIn(
            key,
            inputs[key] as unknown as Expression<PrimitiveValue>[],
          )
        : query.where(key, inputs[key] as unknown as string);
    }
    const models = await query;
    if (error && models.length == 0) this.raiseError();

    return models;
  }

  /**
   * Create a new model with given inputs
   * @param inputs
   */
  async create(inputs: ModelKeys<T>): Promise<T> {
    return this.query().insert(inputs).returning('*') as unknown as T;
  }

  /**
   * Create a new model with given inputs
   * @param inputs
   */
  async createWithTransaction(
    trx: Transaction,
    inputs: ModelKeys<T>,
  ): Promise<T> {
    return this.model.query(trx).insert(inputs).returning('*') as unknown as T;
  }

  /**
   * Update or Create model with given condition and values
   * @param conditions
   * @param values
   */
  async createOrUpdate(
    conditions: ModelKeys<T>,
    values: ModelKeys<T>,
  ): Promise<T | undefined> {
    const model = await this.firstWhere(conditions, false);
    if (!model) {
      return this.create({ ...conditions, ...values });
    }

    await this.update(model, values);
    return await this.firstWhere(conditions, false);
  }

  /**
   * First or Create model with given condition and values
   *
   * @param conditions
   * @param values
   */
  async firstOrNew(conditions: ModelKeys<T>, values: ModelKeys<T>): Promise<T> {
    const model = await this.firstWhere(conditions, false);
    if (model) return model;
    return await this.create({ ...conditions, ...values });
  }

  /**
   * Update the given model with values
   * @param model
   * @param setValues
   */
  async update(model: T, setValues: ModelKeys<T>): Promise<number | null> {
    const query = this.query<number>();
    query.findById(model.id).patch(setValues);
    return await query;
  }

  /**
   * Update all models where condition is matched
   * @param where
   * @param setValues
   */
  async updateWhere(
    where: ModelKeys<T>,
    setValues: ModelKeys<T>,
  ): Promise<number | null> {
    const query = this.query<number>();
    query.where(where).patch(setValues);
    return query;
  }

  /**
   * Check if any model exists where condition is matched
   * @param params
   */
  async exists(params: T): Promise<boolean> {
    const query = this.query();
    query.where(params);
    return !!(await query.onlyCount());
  }

  /**
   * Get count of rows matching a criteria
   * @param params
   */
  async count(params?: T): Promise<number> {
    const query = this.query();
    if (params) {
      query.where(params);
    }

    return await query.onlyCount();
  }

  /**
   * Delete a model
   *
   * @param model
   */
  async delete(model: T | number): Promise<boolean> {
    return !!+(await this.query().deleteById(
      typeof model != 'object' ? model : model.id,
    ));
  }

  /**
   * Delete documents where query is matched.
   *
   * @param inputs T
   */
  async deleteWhere<T>(inputs: T): Promise<boolean> {
    const query = this.query();

    for (const key in inputs) {
      Array.isArray(inputs[key])
        ? query.whereIn(key, inputs[key] as unknown as any[])
        : query.where(key, inputs[key] as unknown as any);
    }
    return !!+(await query.delete());
  }

  /**
   * Refresh a model
   *
   * @param model
   */
  async refresh(model: T): Promise<T | undefined> {
    return model ? await this.query().findById(model.id) : undefined;
  }

  /**
   * Relate ids to a model
   * @param model
   * @param relation
   * @param payload
   */
  async attach(
    model: T,
    relation: string,
    payload: number | string | Array<number | string> | Record<string, any>,
  ): Promise<void> {
    await model.$relatedQuery(relation).relate(payload);
    return;
  }

  /**
   * Sync relation with a model
   * @param model
   * @param relation
   * @param payload
   */
  async sync(model: T, relation: string, payload: any[]): Promise<void> {
    await model.$relatedQuery(relation).unrelate();
    if (Array.isArray(payload) && payload.length > 0) {
      await model.$relatedQuery(relation).relate(payload);
    }
    return;
  }

  /**
   * Fetch a chunk and run callback
   */
  async chunk(
    where: T,
    size: number,
    cb: (models: T[]) => void,
  ): Promise<void> {
    const query = this.query();
    query.where(where);
    await query.chunk(cb, size);
    return;
  }

  /**
   * Throws model not found exception.
   *
   * @throws ModelNotFoundException
   */
  raiseError(): void {
    throw new ModelNotFound(this.getEntityName() + ' not found');
  }

  /**
   * Returns new Query Builder Instance
   */
  query<R = T>(): CustomQueryBuilder<T, R> {
    if (!this.knexConnection) {
      this.knexConnection = ObjectionService.connection(this.model.connection);
    }

    return this.model.query(this.knexConnection);
  }

  queryTransaction<R = T>(trx: Transaction): CustomQueryBuilder<T, R> {
    return this.model.query(trx);
  }

  getEntityName(): string {
    return this.model.name;
  }

  /**
   * Update rows where condition is matched and return modified rows
   * @param where
   * @param setValues
   * @param returnOne Set this true when you want only the first object to be returned
   */
  async updateAndReturn(where: T, setValues: ModelKeys<T>): Promise<T | T[]> {
    const query = this.query();
    const records = await query.where(where).patch(setValues).returning('*');
    if (records.length == 1) return records[0];
    return records;
  }

  async updateById(id: MaybeCompositeId, setValues: ModelKeys<T>): Promise<T> {
    const query = this.query();
    const record = await query.updateAndFetchById(id, setValues);
    return record;
  }

  /**
   * Bulk insert new models with given inputs,
   * currently only works in mysql.
   * @param inputs
   */
  async bulkInsert(inputs: ModelKeys<T>[]): Promise<T[]> {
    return this.query().insert(inputs).returning('*') as unknown as T[];
  }

  with(queryBuilder: T, include: string): Promise<T>;
  with(queryBuilder: T[], include: string): Promise<T[]>;
  async with(queryBuilder: T | T[], include: string): Promise<any> {
    if (!this.knexConnection) {
      this.knexConnection = ObjectionService.connection(this.model.connection);
    }

    const relations = getRelationsFromIncludes(include, this.model.withIgnores);

    return this.model.fetchGraph(queryBuilder, relations, {
      transaction: this.knexConnection,
    });
  }

  async findById(id: MaybeCompositeId): Promise<T> {
    return this.query().findById(id);
  }

  async paginate(
    queryBuilder: AnyQueryBuilder,
    page: number,
    perPage: number,
  ): Promise<{ items: T[]; pagination: Record<string, any> }> {
    page = +page ? +page : 1;
    perPage = +perPage ? +perPage : 20;

    const result = await queryBuilder.page(page - 1, perPage);
    return {
      pagination: {
        current_page: page,
        total_pages: Math.ceil(result.total / perPage),
        per_page: perPage,
        total: result.total,
      },
      items: result.results as T[],
    };
  }
}
