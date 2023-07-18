const log = [];

const ignoredProps: PropertyKey[] = [
  "__implementation",
  Symbol.toStringTag,
  Symbol.iterator,
  "$$typeof",
  "@@__IMMUTABLE_RECORD__@@",
  "hasAttribute",
  "tagName",
  "nodeType",
  "onSuccess",
  "toString",
  Symbol.toPrimitive,
  Symbol.toStringTag,
  "splice",
  "prototype",
];

const logger = {
  push(...rest) {
    console.log(...rest);
    log.push(...rest);
  },
};

function getSpyHandler(prefix?: string, depth?: number) {
  const spyHandler: ProxyHandler<object> = {
    get(target: object, prop: PropertyKey, receiver?) {
      //   log.push({ target, prefix, prop, receiver });
      //   const wrappedTarget =
      //     typeof target === "function" ? wrapFunction(target) : target;

      if (prop === "__proxy_name") {
        return prefix;
      }

      if (prop === "__proxy_log") {
        return log;
      }

      const name = `${prefix}.${prop.toString()}`;
      const reflection = Reflect.get(target, prop, receiver);

      logger.push({
        type: "get",
        name,
        target,
        prop,
        receiver,
      });

      const returnNestedProxy =
        depth < 4 &&
        !ignoredProps.includes(prop) &&
        (typeof reflection == "function" || typeof reflection == "object");

      return returnNestedProxy
        ? wrapWithProxy(reflection, name, depth + 1)
        : reflection;
    },

    set(target: object, prop: PropertyKey, value, receiver?) {
      const name = `${prefix}.${prop.toString()}`;
      const ignoredNames = ["root.utils.generateGuid"];

      logger.push({
        type: "set",
        name,
        target,
        prop,
        value,
        receiver,
      });

      if (
        !Object.prototype.hasOwnProperty.call(target, prop) &&
        !ignoredNames.includes(name)
      ) {
        console.warn(
          `setting property "${prop.toString()}" on "${prefix}" ${target}`
        );
        Reflect.set(target, prop, value, receiver);
      }

      return true;
    },

    // eslint-disable-next-line @typescript-eslint/ban-types
    // construct(target: Function, argumentList, newTarget: Function) {
    //   console.log("construct", target, argumentList, newTarget);
    //   return Reflect.construct(target, argumentList, newTarget);
    // },

    // eslint-disable-next-line @typescript-eslint/ban-types
    apply(target: Function, thisArg, argumentList) {
      const name = `${thisArg.__proxy_name}.${target.name}`;

      // this causes infinite loop
      // if (
      //   argumentList &&
      //   argumentList[0] &&
      //   argumentList[0]["onSuccess"] &&
      //   typeof argumentList[0]["onSuccess"] === "function"
      // ) {
      //   const oldOnSuccess = argumentList[0]["onSuccess"];
      //   argumentList[0]["onSuccess"] = function (...onSuccessArgs) {
      //     logger.push({ type: "callback.onSuccess", name, onSuccessArgs });
      //     return oldOnSuccess(...onSuccessArgs);
      //   };
      // }

      logger.push({ type: "apply", name, target, thisArg, argumentList });
      return Reflect.apply(target, thisArg, argumentList);
    },
  };
  return spyHandler;
}

export function wrapWithProxy<T extends object>(
  target: T,
  prefix = "root",
  depth = 0
): T & { __proxy_log: typeof log } {
  console.log("wrapWithProxy", { target, prefix, depth });
  if (typeof target !== "object" && typeof target !== "function") {
    // console.log("skipping", typeof target, target);
    return target;
  }
  return new Proxy(target, getSpyHandler(prefix, depth)) as T & {
    __proxy_log: typeof log;
  };
}
