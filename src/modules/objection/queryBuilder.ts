import {
  Expression,
  Model,
  OrderByDirection,
  Page,
  PrimitiveValue,
  QueryBuilder,
} from 'objection';
import { GenericFunction, Pagination } from './interfaces';

export class CustomQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<
  M,
  R
> {
  ArrayQueryBuilderType!: CustomQueryBuilder<M, M[]>;
  SingleQueryBuilderType!: CustomQueryBuilder<M, M>;
  NumberQueryBuilderType!: CustomQueryBuilder<M, number>;
  PageQueryBuilderType!: CustomQueryBuilder<M, Page<M>>;

  _withGraph(exp, options, algorithm) {
    const node = exp?.node;
    // @ts-ignore
    this.modelClass().withIgnores.forEach((withIgnore) => {
      if (node) {
        delete node[withIgnore];
        if (node['$childNames']) {
          node['$childNames'] = node['$childNames'].filter(
            (item) => item != withIgnore,
          );
        }
      }
    });
    // @ts-ignore
    return super._withGraph(exp, options, algorithm);
  }

  async paginate<T>(page: number, perPage: number): Promise<Pagination<T>> {
    page = +page ? +page : 1;
    perPage = +perPage ? +perPage : 15;

    const result = await this.page(page - 1, perPage);
    return {
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / perPage),
        perPage,
        total: result.total,
      },
      data: result.results as unknown as T[],
    };
  }

  async allPages<T>(): Promise<Pagination<T>> {
    return { data: (await this) as unknown as T[] };
  }

  async onlyCount() {
    const result = (await this.count({ c: '*' })) as unknown as { c: number }[];
    return +result[0].c;
  }

  async exists() {
    const result = await this.onlyCount();
    return !!result;
  }

  async chunk(cb: GenericFunction, size: number): Promise<void> {
    let offset = 0;
    let hasMore = true;
    while (!!!offset || hasMore) {
      const query = structuredClone(this);
      const records = (await query
        .offset(offset)
        .limit(size)) as unknown as M[];
      hasMore = !(records.length > 0);
      if (!hasMore) return;
      await cb(records);
      offset += size;
    }
  }

  cOrderBy(expressions: string): this {
    const orders = (expressions || '').split('|');
    for (const order of orders) {
      const [column, direction] = order.split(':');
      if (!column) continue;
      this.orderBy(column, (direction || 'ASC') as OrderByDirection);
    }

    return this;
  }

  when(
    condition: any,
    truthyCb: (query: CustomQueryBuilder<M, R>, condition: any) => this,
    falsyCb?: (query: CustomQueryBuilder<M, R>, condition: any) => this,
  ): this {
    if (condition) {
      return truthyCb(this, condition);
    } else if (falsyCb) {
      return falsyCb(this, condition);
    } else {
      return this;
    }
  }

  safeWhereIn(col: string, expr: Expression<PrimitiveValue>): this {
    if (!Array.isArray(expr)) return this;
    if (Array.isArray(expr) && expr.length < 1) return this;

    return this.whereIn(col, expr);
  }

  safeWhereNotIn(col: string, expr: Expression<PrimitiveValue>): this {
    if (!Array.isArray(expr)) return this;
    if (Array.isArray(expr) && expr.length < 1) return this;

    return this.whereNotIn(col, expr);
  }

  delete() {
    const modelClass = this.modelClass();
    // @ts-ignore
    if (!modelClass.softDelete) {
      return super.delete();
    }
    this.context({
      softDelete: true,
    });
    const patch = {};
    // @ts-ignore
    patch[modelClass.deleteColumn] = new Date();
    return this.patch(patch);
  }

  // provide a way to actually delete the row if necessary
  hardDelete() {
    return super.delete();
  }

  // provide a way to undo the delete
  undelete() {
    const modelClass = this.modelClass();
    // @ts-ignore
    if (!modelClass.softDelete) {
      return this.patch({});
    }
    this.context({
      undelete: true,
    });
    const patch = {};
    // @ts-ignore
    patch[modelClass.deleteColumn] = null;
    return this.patch(patch);
  }

  // provide a way to filter to ONLY deleted records without having to remember the column name
  whereDeleted() {
    const modelClass = this.modelClass();
    // @ts-ignore
    if (!modelClass.softDelete) {
      return this;
    }
    // @ts-ignore
    const tableRef = this.tableRefFor(this.modelClass());
    // qualify the column name
    return this.whereNotNull(
      // @ts-ignore
      `${tableRef}.${modelClass.deleteColumn}`,
    );
  }

  // provide a way to filter out deleted records without having to remember the column name
  whereNotDeleted() {
    const modelClass = this.modelClass();
    // @ts-ignore
    if (!modelClass.softDelete) {
      return this;
    }
    // @ts-ignore
    const tableName = this.tableRefFor(modelClass);
    // qualify the column name
    return this.whereNull(
      // @ts-ignore
      `${tableName}.${modelClass.deleteColumn}`,
    );
  }
}
