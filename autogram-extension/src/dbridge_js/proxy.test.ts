import { wrapWithProxy } from "./proxy";

describe("proxy", () => {
  beforeEach(() => {
    wrapWithProxy({}).__proxy_log.length = 0;
  });

  test("late strict-mode component scripts cannot overwrite existing adapters", () => {
    const deploy = jest.fn();
    const target = { dSigXadesBpJs: { deploy } };
    const wrapped = wrapWithProxy(target);
    const overwrite = new Function(
      "ditec",
      `
      "use strict";
      ditec.dSigXadesBpJs = {};
      ditec.dSigXadesBpJs.deploy = function () { throw new Error("DB206"); };
    `
    );
    expect(() => overwrite(wrapped)).not.toThrow();
    expect(target.dSigXadesBpJs.deploy).toBe(deploy);
  });

  test("late component scripts can define helpers and extend their prototypes", () => {
    const target = { utils: {} };
    const wrapped = wrapWithProxy(target);
    const addHelper = new Function(
      "ditec",
      `
      "use strict";
      ditec.utils.ChainedCallback = function () {};
      ditec.utils.ChainedCallback.prototype.onSuccess = function () { return "ok"; };
      return new ditec.utils.ChainedCallback().onSuccess();
    `
    );
    expect(addHelper(wrapped)).toBe("ok");
  });

  test("to run", () => {
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
    wrapped.toString();
    // property gets are only logged for functions; the wrapped onSuccess
    // callback and the apply trap add their own entries
    expect(wrapped.__proxy_log).toEqual([
      expect.objectContaining({ type: "get", name: "root.fn", prop: "fn" }),
      expect.objectContaining({ type: "apply", name: "root.fn" }),
      expect.objectContaining({
        type: "callback.onSuccess",
        name: "root.fn",
        onSuccessArgs: ["success"],
      }),
      expect.objectContaining({
        type: "get",
        name: "root.toString",
        prop: "toString",
      }),
    ]);
  });
});
