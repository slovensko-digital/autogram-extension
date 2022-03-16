const log = [];

function getSpyHandler(prefix?: string, depth?: number) {
  const spyHandler = {
    get(target, prop, receiver) {
      console.log("get", typeof target, target, prop, receiver, prefix);
      //   log.push({ target, prefix, prop, receiver });
      //   const wrappedTarget =
      //     typeof target === "function" ? wrapFunction(target) : target;

      if (prop == "__proxy_name") {
        return prefix;
      }

      const name = `${prefix}.${prop.toString()}`;
      const reflection = Reflect.get(target, prop, receiver);
      return depth < 3 && prop !== "__implementation"
        ? wrapWithProxy(reflection, name, depth + 1)
        : reflection;
    },
    construct(target, argumentList, newTarget) {
      console.log("construct", target, argumentList, newTarget);
      return Reflect.construct(target, argumentList, newTarget);
    },
    apply(target, thisArg, argumentList) {
      console.log("apply", typeof target, target, thisArg, argumentList);
      const [fnName, argTail] = argumentList;
      const name = `${thisArg.__proxy_name}.${fnName}`;

    // this causes infinite loop
    //   if (
    //     argTail &&
    //     argTail[0] &&
    //     argTail[0]["onSuccess"] &&
    //     typeof argTail[0]["onSuccess"] === "function"
    //   ) {
    //     argTail[0]["onSuccess"] = function (...onSuccessArgs) {
    //       console.log(`callback ${name}:onSuccess`, onSuccessArgs);
    //       return argTail[0]["onSuccess"](...onSuccessArgs);
    //     };
    //   }
      console.log(`calling ${name}`, argTail);
      return Reflect.apply(target, thisArg, argumentList);
    },
  };
  return spyHandler;
}

export function wrapWithProxy(target: any, prefix = "", depth = 0) {
  console.log(target);
  if (typeof target !== "object" && typeof target !== "function") {
    console.log("skipping", typeof target, target);
    return target;
  }
  return new Proxy(target, getSpyHandler(prefix, depth));
}
