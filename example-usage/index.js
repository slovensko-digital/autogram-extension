/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

/**
 * Super small framework for inserting data into the DOM
 * @param {*} selector 
 * @returns 
 */
function $(selector) {
  const el = document.querySelector(`[\\$="${selector}"]`);
  const obj = { el };
  Object.defineProperty(obj, "w", {
    get: () => el,
    set: (value) => {
      el.innerHTML = value;
    },
  });

  Object.defineProperty(obj, "j", {
    set: (value) => {
      el.innerHTML = JSON.stringify(value);
    },
  });
  return obj;
}

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
  ditec.dSigXadesJs.addTxtObject(
    "objectId",
    "objectDescription",
    "sourceTxt",
    "objectFormatIdentifier",
    {
      onSuccess: (documentId, ...rest) => {
        console.log("addObject", documentId, ...rest);
        $("addObject").j = { documentId };
      },
      onError: (error) => {
        $("addObject").j = { error };
      },
    }
  );
}

function sign() {
  ditec.dSigXadesJs.sign(
    "signatureId",
    ditec.dSigXadesJs.SHA256,
    "signaturePolicyIdentifier",
    {
      onSuccess: (documentId, ...rest) => {
        console.log("sign", documentId, ...rest);
        $("sign").j = { documentId };
      },
      onError: (error) => {
        $("sign").j = { error };
      },
    }
  );
}

function getSignerIdentification() {
  ditec.dSigXadesJs.getSignerIdentification({
    onSuccess: (signerIdentification, ...rest) => {
      console.log("getSignerIdentification", signerIdentification, ...rest);
      $("getSignerIdentification").j = { signerIdentification };
    },
    onError: (error) => {
      $("getSignerIdentification").j = { error };
    },
  });
}

function getSignedXmlWithEnvelopeBase64() {
  ditec.dSigXadesJs.getSignedXmlWithEnvelopeBase64({
    onSuccess: (signedXmlWithEnvelopeBase64, ...rest) => {
      console.log(
        "getSignedXmlWithEnvelopeBase64",
        signedXmlWithEnvelopeBase64,
        ...rest
      );
      $("getSignedXmlWithEnvelopeBase64").j = { signedXmlWithEnvelopeBase64 };
      $("getSignedXmlWithEnvelopeBase64Decoded").j = {
        signedXmlWithEnvelope: atob(signedXmlWithEnvelopeBase64),
      };
    },
    onError: (error) => {
      $("getSignedXmlWithEnvelopeBase64").j = { error };
    },
  });
}

function openPopup() {
  postMessage("openPopup", "*");
  window.dispatchEvent(
    new CustomEvent("PassToBackground", { detail: "hello" })
  );
  try {
    chrome.runtime.sendMessage("", { message: "openPopup" }, (response) => {
      console.log("response", response);
    });
  } catch (e) {
    console.log(e);
  }
}

window.addEventListener("PassToBackground", (event) => {
  console.log("PassToBackground recieved in page", event);
});

window.addEventListener("message", (event) => {
  console.log("message recieved in page", event);
});
