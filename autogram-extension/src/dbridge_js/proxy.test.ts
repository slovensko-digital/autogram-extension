import { wrapWithProxy } from "./proxy";

describe("proxy", () => {
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
