import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { validationExceptionFactory } from './validation';

export interface ArrayDto<T> extends Array<T> {
  items: T[];
}

// Don't make it extend Array<T>, it would break the validation as a field called 0 would be needed.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ArrayDto<T> {}

export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: validationExceptionFactory,
    });
  }
  public async transform(value: any, argumentMetadata?: ArgumentMetadata): Promise<any> {
    if (argumentMetadata.metatype && argumentMetadata.metatype.prototype instanceof ArrayDto) {
      const res = await super.transform(new argumentMetadata.metatype(value), argumentMetadata);
      // Now, res contains an ArrayDto with the right types inside.
      // We want to convert it what the interface tells it is.
      // First, we can take the items, we now have the most part of the type.
      const toArray = res.items;
      // We only need the items field, so we add it.
      toArray.items = res.items;
      // And return the result
      return toArray;
    }
    return super.transform(value, argumentMetadata);
  }
}
