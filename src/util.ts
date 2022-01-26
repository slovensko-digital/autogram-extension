export function TODO(...rest: any[]): void {
  // eslint-disable-next-line prefer-rest-params
  console.debug("TODO:", rest, arguments);
}


export function isSafari(): boolean{
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}