export class UserCancelledSigningException extends Error {
  constructor() {
    super("User cancelled signing");
    this.name = "UserCancelledSigningException";
  }
}

export class AutogramSdkException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AutogramSdkException";
  }
}
