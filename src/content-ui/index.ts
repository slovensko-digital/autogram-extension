import styleCss from "./style.css";

export function createUI() {
  console.log("createUI");
  customElements.define("autogram-root", AutogramRoot);

  const root = document.createElement("autogram-root");

  document.body.appendChild(root);
}

// TODO mozno pouzit lit
class AutogramRoot extends HTMLElement {
  _content: HTMLElement;
  header = "Ako si prajete dokument podpísať?";
  main: string | null = null;
  footer: HTMLElement | null = null;
  constructor() {
    super();
    console.log("AutogramRoot constructor");

    this.addFonts();

    const root = document.createElement("div");

    const style = document.createElement("style");
    style.textContent = styleCss;

    this._content = document.createElement("div");
    this.screen1()
    this.render();

    root.appendChild(style);
    root.appendChild(this._content);
    this.attachShadow({ mode: "closed" }).appendChild(root);
  }
  render() {
    this._content.innerHTML = `
    <div class="dialog">
            <div class="heading">
                <h1>${this.header}</h1>
                <button class="close">${closeSvg}
                </button>
            </div>
            <div class="main">
            ${this.main}
            </div>
            ${
              this.footer
                ? `<div class="footer">
            ${this.footer}
            </div>`
                : ""
            }
    </div>
        `;

    const close = this._content.querySelector(".close");
    if (close) {
      close.addEventListener("click", () => {
        this.hide();
      });
    }
  }

  screen1() {
    this.main = `
    <div class="screen1">
        <button class="tile" onclick="console.log(ditec)">
            ${computerSvg}
            <h2>Podpísať čítačkou</h2>
            <div>Podpíšte jednoducho a právne závezne cez <b>Autogram</b>.</div>
        </button> 

        <button class="tile">
            ${mobileSvg}
            <h2>Podpísať mobilom</h2>
            <div>Dokumenty z vašho počítaču môžete podpisovať aj&nbsp;mobilom pomocou aplikácie <b>Autogram v&nbsp;mobile</b>.</div>
        </button> 
    `;
  }

  show() {
    this.style.display = "block";
  }
  hide() {
    this.style.display = "none";
  }

  addFonts() {
    /* 
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anonymous+Pro:ital,wght@0,400;0,700;1,400;1,700&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet">
    */
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://fonts.googleapis.com";

    const link2 = document.createElement("link");
    link2.rel = "preconnect";
    link2.href = "https://fonts.gstatic.com";
    link2.crossOrigin = "anonymous";

    const link3 = document.createElement("link");
    link3.rel = "stylesheet";
    link3.href =
      "https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap";

    document.head.appendChild(link);
    document.head.appendChild(link2);
    document.head.appendChild(link3);
  }
}

const closeSvg = `
<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" y="0.5" width="33" height="33" rx="4.5" stroke="black"/>
<g clip-path="url(#clip0_655_204)">
<path d="M23.3002 10.7102C22.9102 10.3202 22.2802 10.3202 21.8902 10.7102L17.0002 15.5902L12.1102 10.7002C11.7202 10.3102 11.0902 10.3102 10.7002 10.7002C10.3102 11.0902 10.3102 11.7202 10.7002 12.1102L15.5902 17.0002L10.7002 21.8902C10.3102 22.2802 10.3102 22.9102 10.7002 23.3002C11.0902 23.6902 11.7202 23.6902 12.1102 23.3002L17.0002 18.4102L21.8902 23.3002C22.2802 23.6902 22.9102 23.6902 23.3002 23.3002C23.6902 22.9102 23.6902 22.2802 23.3002 21.8902L18.4102 17.0002L23.3002 12.1102C23.6802 11.7302 23.6802 11.0902 23.3002 10.7102Z" fill="black"/>
</g>
<defs>
<clipPath id="clip0_655_204">
<rect width="24" height="24" fill="white" transform="translate(5 5)"/>
</clipPath>
</defs>
</svg>`;

const computerSvg = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_646_952)">
<path d="M6 10.5C6 9.675 6.675 9 7.5 9H31.5C32.325 9 33 8.325 33 7.5C33 6.675 32.325 6 31.5 6H6C4.35 6 3 7.35 3 9V25.5H2.25C1.005 25.5 0 26.505 0 27.75C0 28.995 1.005 30 2.25 30H21V25.5H6V10.5ZM34.5 12H25.5C24.675 12 24 12.675 24 13.5V28.5C24 29.325 24.675 30 25.5 30H34.5C35.325 30 36 29.325 36 28.5V13.5C36 12.675 35.325 12 34.5 12ZM33 25.5H27V15H33V25.5Z" fill="#126DFF"/>
</g>
<defs>
<clipPath id="clip0_646_952">
<rect width="36" height="36" fill="white"/>
</clipPath>
</defs>
</svg>
`;

const mobileSvg = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_646_961)">
<path d="M27.0001 1.515L12.0001 1.5C10.3501 1.5 9.00008 2.85 9.00008 4.5V9C9.00008 9.825 9.67508 10.5 10.5001 10.5C11.3251 10.5 12.0001 9.825 12.0001 9V7.5H27.0001V28.5H12.0001V27C12.0001 26.175 11.3251 25.5 10.5001 25.5C9.67508 25.5 9.00008 26.175 9.00008 27V31.5C9.00008 33.15 10.3501 34.5 12.0001 34.5H27.0001C28.6501 34.5 30.0001 33.15 30.0001 31.5V4.5C30.0001 2.85 28.6501 1.515 27.0001 1.515ZM16.5001 22.5C17.3251 22.5 18.0001 21.825 18.0001 21V13.5C18.0001 12.675 17.3251 12 16.5001 12H9.00008C8.17508 12 7.50008 12.675 7.50008 13.5C7.50008 14.325 8.17508 15 9.00008 15H12.8851L5.55008 22.335C4.96508 22.92 4.96508 23.865 5.55008 24.45C6.13508 25.035 7.08008 25.035 7.66508 24.45L15.0001 17.115V21C15.0001 21.825 15.6751 22.5 16.5001 22.5Z" fill="#126DFF"/>
</g>
<defs>
<clipPath id="clip0_646_961">
<rect width="36" height="36" fill="white"/>
</clipPath>
</defs>
</svg>
`;
