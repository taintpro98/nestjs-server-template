import { Knex } from 'knex';
import chalk from 'chalk';
import { convertDateToUnixTimestamp, convertISOString2Seconds } from '@utils';

export type KnexLoggerOptions = {
  logger?: (message?: any, ...optionalParams: any[]) => void;
  bindings?: boolean;
};
type KnexLoggerStartTime = [number, number];

type KnexLoggerQuery = {
  sql: string;
  bindings: any;
  startTime: KnexLoggerStartTime;
};
type KnexLoggerQueryForMat = (sql: string, bindings: any) => string;
// type KnexLogerExecutionerFormat = (sql: string, bindings: any, client: Knex, timeZone?: string) => string
const COLORIZE = {
  primary: chalk.magenta,
  error: chalk.red,
  success: chalk.cyan,
};

export default function knexLogger(
  knex: Knex,
  options?: KnexLoggerOptions,
): Knex {
  const logger = options && options.logger ? options.logger : console.log;
  const queries: Map<string, KnexLoggerQuery> = new Map();
  const print = makeQueryPrinter(knex, { logger });

  return knex
    .on('query', handleQuery)
    .on('query-error', handleQueryError)
    .on('query-response', handleQueryResponse);

  function handleQuery({ __knexQueryUid: queryId, sql, bindings }: any) {
    const startTime = measureStartTime();
    queries.set(queryId, { sql, bindings, startTime });
  }

  function handleQueryError(_error: any, { __knexQueryUid: queryId }: any) {
    withQuery(queryId, ({ sql, bindings, duration }: any) => {
      print({ sql, bindings, duration }, COLORIZE.error);
    });
  }

  function handleQueryResponse(
    _response: any,
    { __knexQueryUid: queryId }: any,
  ) {
    withQuery(queryId, ({ sql, bindings, duration }: any) => {
      print({ sql, bindings, duration }, COLORIZE.success);
    });
  }

  function withQuery(queryId: string, fn: any) {
    const query = queries.get(queryId);
    queries.delete(queryId);
    if (!query) throw new TypeError('Query disappeared');
    const { sql, bindings, startTime } = query;
    const duration = measureDuration(startTime);
    fn({ sql, bindings, duration });
  }
}

function makeQueryPrinter(knex: Knex, { logger }: any) {
  return function print({ sql, bindings, duration }: any, colorize: any) {
    const sqlRequest = formatQuery(sql, bindings);
    const messageLog = {
      raw_sql: sql,
      binding_sql: sqlRequest,
      duration: Number(duration.toFixed(3)),
      level: 'INFO',
      timestamp: convertDateToUnixTimestamp(),
    };
    const jsonString = JSON.stringify(messageLog).replace(/\\"/g, "'");
    logger(jsonString);
  };
}

function measureStartTime() {
  return process.hrtime();
}

function measureDuration(startTime: KnexLoggerStartTime): number {
  const diff = process.hrtime(startTime);
  const duration = diff[0] * 1e3 + diff[1] * 1e-6;
  return duration;
}

const formatQuery: KnexLoggerQueryForMat = (sql: string, bindings: any) => {
  let builtSql = sql;
  if (bindings && bindings.length) {
    bindings.forEach((bind: any) => {
      if (bind === null) {
        bind = 'null';
      }
      if (typeof bind === 'string' || Array.isArray(bind)) {
        bind = "'" + bind + "'";
      }
      if (bind instanceof Date) {
        bind = "'" + bind.toISOString() + "'";
      }
      builtSql = builtSql.replace(/\$\d{0,5}/, bind);
    });
  }
  return builtSql;
};
// function formatQuery: KnexLogerExecutionerFormat = (sql, bindings, timeZone, client) => {
//     bindings = bindings == null ? [] : [].concat(bindings);
//     let index = 0;
//     return sql.replace(/\\?\?/g, (match) => {
//         if (match === '\\?') {
//             return '?';
//         }
//         if (index === bindings.length) {
//             return match;
//         }
//         const value = bindings[index++];
//         return client._escapeBinding(value, { timeZone });
//     });
// }
