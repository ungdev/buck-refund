import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Error codes
 * @enum {number} ERROR_CODE - Error codes used in the API to identify errors and send the correct
 * HTTP status code and message to the client.
 * All error data is stored in {@link ErrorData}.
 *
 * Guidelines for error codes:
 * - 1xxx: Authentication errors
 * - 2xxx: Parameter errors
 * - 3xxx: Permission errors. This includes all http 403 errors.
 * - 4xxx: Resource errors. This includes all http 404 errors.
 */
export const enum ERROR_CODE {
  NOT_LOGGED_IN = 1001,
  PARAM_DOES_NOT_EXIST = 2001,
  PARAM_MALFORMED = 2002,
  PARAM_MISSING = 2003,
  PARAM_NOT_STRING = 2004,
  PARAM_NOT_ALPHANUMERIC = 2005,
  PARAM_NOT_NUMBER = 2006,
  PARAM_NOT_ENUM = 2007,
  PARAM_NOT_DATE = 2008,
  PARAM_NOT_UUID = 2009,
  PARAM_TOO_LONG = 20010,
  PARAM_TOO_SHORT = 2011,
  PARAM_SIZE_TOO_SMALL = 2012,
  PARAM_SIZE_TOO_BIG = 2013,
  PARAM_IS_EMPTY = 2014,
  PARAM_NOT_POSITIVE = 2015,
  PARAM_TOO_LOW = 2016,
  PARAM_TOO_HIGH = 2017,
  PARAM_NOT_INT = 2018,
  PARAM_DOES_NOT_MATCH_REGEX = 2102,
  IBAN_INVALID = 2103,
  FORBIDDEN_NOT_ENOUGH_PERMISSIONS = 3001,
  NO_TOKEN = 3002,
  INVALID_TOKEN_FORMAT = 3003,
  INVALID_CREDENTIALS = 3004,
}

/**
 * Error data for each error code used in the API.
 * This is used to send the correct HTTP status code and message to the client.
 * The message can contain `%` characters, which will be replaced by data when throwing the {@link AppException}.
 */
export const ErrorData = Object.freeze({
  [ERROR_CODE.NOT_LOGGED_IN]: {
    message: 'You must be logged in to access this resource',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
  [ERROR_CODE.PARAM_DOES_NOT_EXIST]: {
    message: 'The parameter % does not exist',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_MALFORMED]: {
    message: 'The following parameters are invalid: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_MISSING]: {
    message: 'The following parameters are missing: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_NOT_STRING]: {
    message: 'The following parameters must be string: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_NOT_ALPHANUMERIC]: {
    message: 'The following parameters must be alphanumeric: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_NOT_NUMBER]: {
    message: 'The following parameters must be number: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_NOT_ENUM]: {
    message: 'The following parameters must be enum members: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_NOT_DATE]: {
    message: 'The following parameters must be date: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_NOT_UUID]: {
    message: 'The following parameters must be a valid UUID: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_TOO_LONG]: {
    message: 'The following parameters are too long: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_TOO_SHORT]: {
    message: 'The following parameters are too short: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_SIZE_TOO_SMALL]: {
    message: 'The following parameters are too small: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_SIZE_TOO_BIG]: {
    message: 'The following parameters are too big: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_IS_EMPTY]: {
    message: 'The following parameters are empty: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_NOT_POSITIVE]: {
    message: 'The following parameters must be positive: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_TOO_LOW]: {
    message: 'The following parameters must be higher: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_TOO_HIGH]: {
    message: 'The following parameters must be lower: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_NOT_INT]: {
    message: 'The following parameters must be integers: %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.PARAM_DOES_NOT_MATCH_REGEX]: {
    message: 'The following parameters must match the regex "%": %',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.IBAN_INVALID]: {
    message: 'The provided IBAN is not a valid IBAN',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.FORBIDDEN_NOT_ENOUGH_PERMISSIONS]: {
    message: 'Missing permission %',
    httpCode: HttpStatus.FORBIDDEN,
  },
  [ERROR_CODE.NO_TOKEN]: {
    message: 'No token provided',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.INVALID_TOKEN_FORMAT]: {
    message: 'Token format is invalid',
    httpCode: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODE.INVALID_CREDENTIALS]: {
    message: 'Credentials incorrect',
    httpCode: HttpStatus.UNAUTHORIZED,
  },
} as const) satisfies Readonly<{
  [error in ERROR_CODE]: {
    message: string;
    httpCode: HttpStatus;
  };
}>;

/**
 * Counts the number of occurrences of a string in another string. It the returns a string array type with that number of elements.
 * @example
 * type A = ExtrasTypeBuilder<'hello'>; // []
 * type B = ExtrasTypeBuilder<'%hel%lo%'>; // [string, string, string]
 */
export type ExtrasTypeBuilder<S extends string> = S extends `${infer Part1}%${infer Part2}`
  ? [...ExtrasTypeBuilder<Part1>, ...ExtrasTypeBuilder<Part2>, string]
  : [];

/**
 * An exception that can be thrown in the API. Every exception should be thrown using this class, to ensure that the errors are normalized.
 * @param ErrorCode The error code of the exception.
 * @param extraMessages Strings that will replace the `%` characters in the error message.
 *                      You have to specify as many extra messages as there are `%` characters in the error message.
 *
 * @example
 * throw new AppException(ERROR_CODE.NOT_LOGGED_IN);  // The error message will be : "You must be logged in to access this resource"
 * throw new AppException(ERROR_CODE.PARAM_NOT_UUID, 'groups');  // The error message will be : "The following parameters must be a valid UUID: groups"
 * throw new AppException(ERROR_CODE.PARAM_DOES_NOT_MATCH_REGEX, '^[0-9]{10}$', 'phoneNumber');  // The error message will be : "The following parameters must match the regex "^[0-9]{10}$": phoneNumber"
 */
export class AppException<ErrorCode extends ERROR_CODE> extends HttpException {
  constructor(code: ErrorCode, ...extraMessages: ExtrasTypeBuilder<(typeof ErrorData)[ErrorCode]['message']>) {
    super(
      {
        errorCode: code,
        error: (extraMessages as string[]).reduce(
          (message, extra) => message.replaceAll('%', extra),
          ErrorData[code].message,
        ),
      },
      ErrorData[code].httpCode,
    );
  }
}
