export class SquareboatNestObjection {
  static dbConnection = '@squareboat/nestjs-objection/db_connection';
  static databaseOptions = '@squareboat/nestjs-objection/db_options';
}

export enum ESortBy {
  ASC = 'asc',
  DESC = 'desc',
}

export const MAX_LIMIT_PAGINATION = 50;
