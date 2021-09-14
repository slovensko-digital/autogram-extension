import { apiClient } from "@octosign/client";

console.log("original", (window as any).DSigner);
console.log("original", (window as any).DSignerConstructor);
console.log("original", (window as any).DSignerConstructorClient);

function DSignerCustom() {
  console.log("called");
}

function DSignerConstructorClientCustom() {
  this.sign = function (request: any) {
    console.log(request);
    MessageBox.displayError("WOhooo DSignerConstructorClientCustom");
  };
}

function DSignerConstructorCustom() {
  this.sign = function (request: any) {
    console.log(request);
    MessageBox.displayError("WOhooo DSignerConstructorCustom");
    const client = apiClient();
    console.log(client.getLaunchURL());

    client.waitForStatus("READY").then(async () => {
      const content =
        '<?xml version="1.0"?><Document><Title>Lorem Ipsum</Title></Document>';
      console.log(await client.sign({ content }));
      // => { content: '<?xml version="1.0"?><Document><Title>Lorem Ipsum</Title>...</Document>' }
    });
  };
}

(window as any).DSigner = new DSignerCustom();
DSignerClient = new DSignerCustom();
DSignerConstructor = new DSignerConstructorCustom();
DSignerConstructorClient = new DSignerConstructorClientCustom();

console.log("inject");

console.log(DSignerConstructorClient);

// console.log(DSigner);
// declare var DSigner: any;
declare var DSignerClient: any;
declare var DSignerConstructor: any;
declare var DSignerConstructorClient: any;
declare var MessageBox: any;
