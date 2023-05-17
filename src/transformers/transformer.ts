import { convertObjectToString, convertStringToObject } from '@utils';
import { BaseModel } from '@modules/objection';
import { Transformer$IncludeMethodOptions } from './interfaces';

export abstract class Transformer<T extends BaseModel> {
  public readonly availableIncludes = [];
  public readonly defaultIncludes = [];

  abstract transform(model: T): Promise<Record<string, any> | null>;

  /**
   * Use this when you want to include single object,
   * which is transformed by some other transformer.
   *
   * @param model
   * @param options
   */
  async item(
    model: T,
    options?: Transformer$IncludeMethodOptions,
  ): Promise<Record<string, any> | null> {
    if (!model) return null;
    const includes = this.parseIncludes(options.include);
    return this.work(model, { include: includes });
  }

  /**
   * Use this when you want to include multiple objects,
   * which is transformed by some other transformer.
   *
   * @param arr
   * @param options
   */
  async collection(
    arr: Array<T | string>,
    options?: Transformer$IncludeMethodOptions,
  ): Promise<Array<any>> {
    if (!arr || arr.length === 0) return [];
    const result = [];
    const includes = this.parseIncludes(options.include);
    for (const data of arr) {
      const dataTransformer = await this.work(data, { include: includes });
      result.push(dataTransformer);
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  parseIncludes(include: string[] | string | Object = ''): Record<string, any> {
    return convertStringToObject(include);
  }

  convertObjectToStr(data: string[] | string | object = ''): string {
    return convertObjectToString(data);
  }

  async work(
    data: any,
    options?: Transformer$IncludeMethodOptions,
  ): Promise<Record<string, any> | Array<Record<string, any>>> {
    let result = {};
    if (data instanceof Object) {
      result = await this.transform(data);
    }

    const includes = this.parseIncludes(options.include);

    const handlerName = (name: string) => 'include_' + name;
    for (const include of Object.keys(includes)) {
      const handler = handlerName(include);
      const nestedIncludes = includes[include];
      if (this[handler] && this.availableIncludes.includes(include)) {
        result[include] = await this[handler](data, {
          include: this.convertObjectToStr(nestedIncludes) || '',
        });
      }
    }

    for (const include of this.defaultIncludes) {
      const handler = handlerName(include);
      if (
        this[handler] &&
        this.availableIncludes.includes(include) &&
        !result[include]
      ) {
        result[include] = await this[handler](data, {
          include: '',
        });
      }
    }

    return result;
  }
}
