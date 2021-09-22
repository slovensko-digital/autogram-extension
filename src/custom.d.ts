declare module "*?astext" {
  const str: string;
  export default str;
}

declare module "*.png" {
  const str: string;
  export default str;
}

interface MessageBox {
  displayInfo(msg: string): void;
  displayError(msg: string): void;
  displayConfirm(msg: string): void;
  displayInfoPopup(msg: string): void;
  displayErrorPopup(msg: string): void;
  displayCallbackResult(msg: string): void;
  HeaderInfo: string;
  HeaderWarning: string;
  HeaderError: string;
  iFrameHandler(something: unknown): void;
}

declare let MessageBox: MessageBox;
