import { DBridgeAutogramImpl } from "./autogram-implementation";
import { autogramApiMockFactory } from "./test-mocks";

describe("usual flow", () => {
  beforeAll(() => {
    jest.mock("../../autogram-api", () => {
      return autogramApiMockFactory();
    });
  });
  afterAll(() => {
    jest.unmock("../../autogram-api");
  });
  test("basic", async (done) => {
    const impl = new DBridgeAutogramImpl();
    impl.launch({
      onSuccess: () => {
        impl.setLanguage("sk");
        impl.getVersion({
          onSuccess: (version) => {
            expect(version).toBeTruthy();
          },
        });

        impl.getPlatform({
          onSuccess: (platform) => {
            expect(platform).toContain("dLauncher2");
          },
        });

        impl.getSignerIdentification({
          onSuccess: (signerIdentification) => {
            expect(signerIdentification).toBeTruthy();
          },
        });
      },
    });

    done();
  });
});
