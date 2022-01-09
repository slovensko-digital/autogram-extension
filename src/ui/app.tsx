import React, { useState } from "react";
import Logger from "./logger";
import browser from "webextension-polyfill";
import style from "./style.module.css";
import logo from "../static/logo-32.png";
import clsx from "clsx";

export function App() {
  const [open, setOpen] = useState(true);
  const [position, setPosition] = useState<UIPosition>("left");
  console.log(style);
  return (
    <div
      className={style.ui}
      style={position == "right" ? { right: "0" } : { left: "0" }}
    >
      {open ? (
        <Ui
          onCloseUi={() => {
            setOpen(false);
          }}
        />
      ) : (
        <OpenButton
          onClick={() => {
            setOpen(true);
          }}
        />
      )}

      <PositionToolbar
        onChangePosition={(position: UIPosition) => {
          setPosition(position);
        }}
      />
    </div>
  );
}

function Logo() {
  return <img src={logo} className={style.logo}></img>;
}

function OpenButton(props: { onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      className={clsx([style.btn, style.btnWhite])}
    >
      <Logo />
    </button>
  );
}

function OpenOptionsButton() {
  return (
    <button
      onClick={() => {
        if (browser.runtime.openOptionsPage) {
          browser.runtime.openOptionsPage();
        } else {
          window.open(browser.runtime.getURL("static/options.html"));
        }
      }}
    >
      Options
    </button>
  );
}

function Ui(props: { onCloseUi: () => void }) {
  return (
    <>
      <button onClick={props.onCloseUi}>X</button>
      <h1>
        Octoext <Logo />
      </h1>
      <Logger />
      <OpenOptionsButton />

      <button>Report Bug</button>
    </>
  );
}

function PositionToolbar(props: {
  onChangePosition: (poisiton: UIPosition) => void;
}) {
  return (
    <div>
      <button
        className={clsx([style.btn, style.btnWhite])}
        onClick={() => {
          props.onChangePosition("left");
        }}
      >
        ⏮
      </button>
      <button
        className={clsx([style.btn, style.btnWhite])}
        onClick={() => {
          props.onChangePosition("right");
        }}
      >
        ⏭
      </button>
    </div>
  );
}

type UIPosition = "left" | "right";
