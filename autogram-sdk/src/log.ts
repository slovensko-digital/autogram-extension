import loglevel from "loglevel";
// import prefix from "loglevel-plugin-prefix";
// prefix.reg(loglevel);
// prefix.apply(loglevel);

export interface Logger {
  trace: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export function createLogger(name: string | symbol): Logger {
  const log = loglevel.getLogger(name);
  // TODO this should be configurable from outside of the library
  log.enableAll();

  const originalFactory = log.methodFactory;
  log.methodFactory = function (methodName, logLevel, loggerName) {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);

    return function (...messages: unknown[]) {
      rawMethod(loggerName.toString() + ": ", ...messages);
    };
  };
  log.rebuild();

  // prefix.apply(log, {
  //   format(level, name, timestamp) {
  //     return `[${timestamp}] [${level.toUpperCase()}](${level})} ${name}:`;
  //   },
  // });

  return log;
}
