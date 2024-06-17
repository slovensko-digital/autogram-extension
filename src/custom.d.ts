declare module "*?astext" {
  const str: string;
  export default str;
}

declare module "*.png" {
  const str: string;
  export default str;
}

declare module "*.html" {
  const str: string;
  export default str;
}

declare module "*.module.css" {
  const cssModule: { [key: string]: string };
  export default cssModule;
}

declare module "*.css" {
  const cssString: string;
  export default cssString;
}
