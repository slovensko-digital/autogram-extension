export interface LogMessage {
  type: "info" | "error" | "success";
  msg: string;
  class?: string;
}
