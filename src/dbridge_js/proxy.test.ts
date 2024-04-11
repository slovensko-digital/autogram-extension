import { wrapWithProxy } from "./proxy";

describe("proxy", () => {
  xtest("to run", () => {
    const target = {
      a: "test",
      b: { a: "test" },
      fn: (callback) => {
        target.a = "x";
        callback.onSuccess("success");
      },
    };
    const wrapped = wrapWithProxy(target);
    wrapped.a;
    wrapped.fn({
      onSuccess: (response) => {
        console.log(response);
      },
    });
    wrapped.toString()
    console.log(wrapped.__proxy_log);
    expect(wrapped.__proxy_log).toBe([
      {
        type: "get",
        target: { a: "x", b: null, fn: null },
        prop: "a",
        receiver: { a: "x", b: null, fn: null },
      },
      {
        type: "get",
        target: { a: "x", b: null, fn: null },
        prop: "fn",
        receiver: { a: "x", b: null, fn: null },
      },
      {
        type: "apply",
        target: null,
        thisArg: { a: "x", b: null, fn: null },
        name: "root.fn",
        argumentList: [],
      },
    ]);
  });
});
