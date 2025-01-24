export function TODO(...rest: unknown[]): void {
  // eslint-disable-next-line prefer-rest-params
  console.debug("TODO:", rest, arguments);
}
