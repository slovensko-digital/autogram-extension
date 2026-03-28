import loglevel from "loglevel";
// import prefix from "loglevel-plugin-prefix";
// prefix.reg(loglevel);
// prefix.apply(loglevel);

type Logger = loglevel.Logger & {
  addListener: (
    callback: (
      level: string,
      loggerName: string | symbol,
      args: unknown[]
    ) => void
  ) => void;
  removeListener: (
    callback: (
      level: string,
      loggerName: string | symbol,
      args: unknown[]
    ) => void
  ) => void;
  listeners: Array<
    (level: string, loggerName: string | symbol, args: unknown[]) => void
  >;
};

export function createLogger(name: string | symbol) {
  const log: Logger = loglevel.getLogger(name) as Logger;
  log.enableAll();

  log.listeners = [];
  log.addListener = function (
    callback: (
      level: string,
      loggerName: string | symbol,
      args: unknown[]
    ) => void
  ) {
    log.listeners.push(callback);
  };
  log.removeListener = function (
    callback: (
      level: string,
      loggerName: string | symbol,
      args: unknown[]
    ) => void
  ) {
    log.listeners = log.listeners.filter((listener) => listener !== callback);
  };

  const originalFactory = log.methodFactory;
  log.methodFactory = function (methodName, logLevel, loggerName) {
    const rawMethod = originalFactory(methodName, logLevel, loggerName);

    return function (...messages: unknown[]) {
      log.listeners.forEach((listener) => {
        listener(methodName, loggerName, messages);
      });
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
