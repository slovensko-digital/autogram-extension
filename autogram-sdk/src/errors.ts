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

export class AutogramAppNotInstalledException extends AutogramSdkException {
  constructor() {
    super(
      "Autogram nie je nainštalovaný. Stiahnite si ho na autogram.slovensko.digital"
    );
    this.name = "AutogramAppNotInstalledException";
  }
}
