import { immutableDitec } from "./immutable-ditec";

function makeDitec() {
  const deploy = () => "ours";
  return {
    deploy,
    raw: {
      isAutogram: true,
      utils: { isDitecError: () => true },
      dSigXadesBpJs: { deploy, state: { calls: 0 } },
    },
  };
}

/** Runs `body` as page code with `ditec` in scope, strict or not. */
function pageScript(strict: boolean, body: string) {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function("ditec", (strict ? '"use strict";\n' : "") + body);
}

describe("immutableDitec", () => {
  test.each([
    ["ditec.dSigXadesBpJs = {}"],
    ["ditec.dSigXadesBpJs.deploy = function () {}"],
    ["ditec.utils.isDitecError = function () { return false }"],
    ["ditec.dSigXadesExtenderJs = {}"],
    ["ditec.utils.ChainedCallback = function () {}"],
    ["Object.defineProperty(ditec, 'dSigXadesBpJs', { value: {} })"],
    ["Object.defineProperty(ditec.utils, 'extra', { value: 1 })"],
    ["delete ditec.dSigXadesBpJs"],
    ["Object.setPrototypeOf(ditec.utils, null)"],
  ])("rejects `%s` and leaves ditec unchanged", (statement) => {
    const { raw, deploy } = makeDitec();
    const snapshot =
      JSON.stringify(Object.keys(raw)) + JSON.stringify(Object.keys(raw.utils));
    const ditec = immutableDitec(raw);

    expect(() => pageScript(true, statement)(ditec)).toThrow(TypeError);
    if (!statement.startsWith("Object.")) {
      // Sloppy-mode page code (e.g. justice.sk's driver) must keep running.
      expect(() => pageScript(false, statement)(ditec)).not.toThrow();
    }

    expect(raw.dSigXadesBpJs.deploy).toBe(deploy);
    expect(Object.getPrototypeOf(raw.utils)).toBe(Object.prototype);
    expect(
      JSON.stringify(Object.keys(raw)) + JSON.stringify(Object.keys(raw.utils))
    ).toBe(snapshot);
  });

  test("child objects keep a stable identity", () => {
    const ditec = immutableDitec(makeDitec().raw);
    expect(ditec.dSigXadesBpJs).toBe(ditec.dSigXadesBpJs);
    expect(ditec.utils).toBe(ditec.utils);
  });

  test("state below the direct children stays mutable", () => {
    const { raw } = makeDitec();
    const ditec = immutableDitec(raw);
    ditec.dSigXadesBpJs.state.calls++;
    expect(raw.dSigXadesBpJs.state.calls).toBe(1);
  });
});
