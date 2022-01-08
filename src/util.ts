export function TODO(...rest: any[]): void {
  // eslint-disable-next-line prefer-rest-params
  console.debug("TODO:", rest, arguments);
}
