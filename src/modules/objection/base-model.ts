import { AjvValidator, Model } from 'objection';
import { pick } from './helpers';
import { LoadRelOptions, LoadRelSchema } from './interfaces';
import { CustomQueryBuilder } from './queryBuilder';
import addFormats from 'ajv-formats';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

export class BaseModel extends Model {
  id!: number | string;
  created_at?: Date | null;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  static deleteColumn = 'deleted_at';
  static softDelete = false;
  static useUUID = false;
  static withIgnores = ['detail'];

  /**
   * Specifies the connection to be used by the model.
   */
  static connection: string;

  QueryBuilderType!: CustomQueryBuilder<this>;

  static QueryBuilder = CustomQueryBuilder;
  static useLimitInFirst = true;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  beforeInsert(): void {}

  $beforeInsert(queryContext) {
    super.$beforeInsert(queryContext);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.$modelClass.useUUID && !this.id) {
      this.id = uuidv4();
    }
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  $beforeUpdate(opt, queryContext) {
    super.$beforeUpdate(opt, queryContext);
    this.updated_at = new Date();
  }

  async $forceLoad(
    expression: LoadRelSchema,
    options: LoadRelOptions,
  ): Promise<void> {
    await this.$fetchGraph(expression, options);
  }

  async $load(
    expression: LoadRelSchema,
    options: LoadRelOptions,
  ): Promise<void> {
    const getKeys = (obj: Record<string, any>): Array<Record<string, any>> => {
      const p = [];
      for (const key in obj) {
        const o = { parent: key, children: [] as Record<string, any>[] };
        if (key === '$recursive' || key === '$relation' || key === '$modify') {
          continue;
        }
        const exp = obj[key];
        if (typeof exp === 'object') {
          o.children = getKeys(exp);
        }
        p.push(o);
      }

      return p;
    };

    const p = getKeys(expression);

    const toBeLoadedRelations = {} as Record<string, any>;
    const getUnloadedRelationsList = async (
      model: this,
      rel: Array<any>,
      parent: string,
    ) => {
      for (const o of rel) {
        if (!model || !model[o.parent]) {
          toBeLoadedRelations[
            parent !== '' ? `${parent}.${o.parent}` : o.parent
          ] = true;
        }

        if (o.children.length > 0) {
          getUnloadedRelationsList(
            model[o.parent] as unknown as this,
            o.children,
            o.parent,
          );
        }
      }
    };

    await getUnloadedRelationsList(this, p, '');
    const promises = [];
    const alreadyLoading = [] as string[];
    for (const key in toBeLoadedRelations) {
      const [parent] = key.split('.');

      if (!alreadyLoading.includes(parent)) {
        promises.push(this.$fetchGraph(pick(expression, parent), options));
        alreadyLoading.push(parent);
      }
    }

    await Promise.all(promises);

    return;
  }

  static createValidator() {
    return new AjvValidator({
      onCreateAjv: (ajv) => {
        addFormats(ajv);
      },
      options: {
        allErrors: true,
        validateSchema: true,
        ownProperties: true,
      },
    });
  }

  $beforeValidate(jsonSchema: any, json: any, opt: any) {
    jsonSchema = super.$beforeValidate(jsonSchema, json, opt);
    _.each(jsonSchema.properties, (schema, propertyName) => {
      if (
        schema &&
        typeof schema.format !== 'undefined' &&
        schema.format === 'date-time'
      ) {
        const valueToValidate = json[propertyName];
        if (valueToValidate !== null && _.isDate(valueToValidate)) {
          json[propertyName] = valueToValidate.toISOString();
        }
      }
    });
    return jsonSchema;
  }
}
