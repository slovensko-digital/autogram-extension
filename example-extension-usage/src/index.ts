import { $, visualizeDocument } from "./ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let ditec: any;

function deploy() {
  ditec.dSigXadesBpJs.deploy(
    {
      // platforms: ["java", "dotNet", "dLauncherJava", "dLauncherDotNet"]
    },
    {
      onSuccess: (platforms, ...rest) => {
        console.log("deploy", platforms, ...rest);
        $("deploy").j = { platforms };
      },
      onError: (error) => {
        $("deploy").j = { error };
      },
    }
  );
}

function launch() {
  ditec.dSigXadesJs.initialize({
    onSuccess: (platforms, ...rest) => {
      console.log("launch", platforms, ...rest);
      $("launch").j = { platforms };
    },
    onError: (error) => {
      $("launch").j = { error };
    },
  });
}

function addObject() {
  const { promise, resolve, reject } = promiseWithResolvers();
  ditec.dSigXadesJs.addTxtObject(
    "objectId.txt",
    "objectDescription",
    "sourceTxt",
    "objectFormatIdentifier",
    {
      onSuccess: (documentId, ...rest) => {
        console.log("addObject", documentId, ...rest);
        $("addObject").j = { documentId };
        resolve(documentId);
      },
      onError: (error) => {
        $("addObject").j = { error };
        reject(error);
      },
    }
  );
  return promise;
}

function sign() {
  const { promise, resolve, reject } = promiseWithResolvers();
  ditec.dSigXadesJs.sign(
    "signatureId",
    ditec.dSigXadesJs.SHA256,
    "signaturePolicyIdentifier",
    {
      onSuccess: (documentId, ...rest) => {
        console.log("sign", documentId, ...rest);
        $("sign").j = { documentId };
        resolve(documentId);
      },
      onError: (error) => {
        $("sign").j = { error };
        reject(error);
      },
    }
  );
  return promise;
}

function getSignerIdentification() {
  const { promise, resolve, reject } = promiseWithResolvers();
  ditec.dSigXadesJs.getSignerIdentification({
    onSuccess: (signerIdentification, ...rest) => {
      console.log("getSignerIdentification", signerIdentification, ...rest);
      $("getSignerIdentification").j = { signerIdentification };
      resolve(signerIdentification);
    },
    onError: (error) => {
      $("getSignerIdentification").j = { error };
      reject(error);
    },
  });
  return promise;
}

function getSignedXmlWithEnvelopeBase64() {
  const { promise, resolve, reject } = promiseWithResolvers();
  ditec.dSigXadesJs.getSignedXmlWithEnvelopeBase64({
    onSuccess: (signedXmlWithEnvelopeBase64, ...rest) => {
      console.log(
        "getSignedXmlWithEnvelopeBase64",
        signedXmlWithEnvelopeBase64,
        ...rest
      );
      $("getSignedXmlWithEnvelopeBase64").j = { signedXmlWithEnvelopeBase64 };
      $("getSignedXmlWithEnvelopeBase64Decoded").el.appendChild(
        visualizeDocument({
          content: signedXmlWithEnvelopeBase64,
          mimeType: "application/vnd.etsi.asic-e+zip",
        })
      );
      resolve(signedXmlWithEnvelopeBase64);
    },
    onError: (error) => {
      $("getSignedXmlWithEnvelopeBase64").j = { error };
      reject(error);
    },
  });
  return promise;
}

async function fullUsage() {
  await addObject();
  await sign();
  await getSignedXmlWithEnvelopeBase64();
}

function promiseWithResolvers() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const duration = $("duration");
const start = Date.now();
setInterval(() => {
  duration.w = Math.floor((Date.now() - start) / 1000);
}, 1000);

globalThis["deploy"] = deploy;
globalThis["launch"] = launch;
globalThis["addObject"] = addObject;
globalThis["sign"] = sign;
globalThis["getSignerIdentification"] = getSignerIdentification;
globalThis["getSignedXmlWithEnvelopeBase64"] = getSignedXmlWithEnvelopeBase64;
globalThis["fullUsage"] = fullUsage;
