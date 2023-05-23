const LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const log = {
  level: LEVELS.DEBUG,
  debug: (...args: any[]) => {
    if (log.level <= LEVELS.DEBUG) {
      console.debug(...args);
    }
  },
  info: (...args: any[]) => {
    if (log.level <= LEVELS.INFO) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    if (log.level <= LEVELS.WARN) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (log.level <= LEVELS.ERROR) {
      console.error(...args);
    }
  },
};

export default log;
