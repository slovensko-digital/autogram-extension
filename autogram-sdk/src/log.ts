import loglevel from "loglevel";
// import prefix from "loglevel-plugin-prefix";
// prefix.reg(loglevel);
// prefix.apply(loglevel);

export function createLogger(name: string | symbol) {
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

export interface Logger {
  debug: (...args: unknown[]) => void;
}
