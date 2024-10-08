/**
 * Filters an object from the given keys. This function returns a new object and does not mutate the original one.
 * @param obj The object to transform.
 * @param keys The keys to omit.
 */
export function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K>;
/**
 * Filters an object from the given keys. This overload can be used in a pipe,
 * for example with `Array.map` or `Promise.then`.
 * @param keys The keys to omit.
 */
export function omit<T extends object, K extends keyof T>(...keys: K[]): (obj: T) => Omit<T, K>;
export function omit<T extends object, K extends keyof T>(objOrKey: T | K, ...keys: K[]) {
  return typeof objOrKey === 'object'
    ? (Object.fromEntries(Object.entries(objOrKey).filter(([key]) => !keys.includes(key as K))) as Omit<T, K>)
    : (value: T) => omit<T, K>(value, objOrKey as K, ...keys);
}
