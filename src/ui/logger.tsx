import React, { useEffect, useState } from "react";
import { extensionId } from "../constants";
import style from "./style.module.css";

type LogMessage = any;

export default function Log() {
  console.log("log");
  const [messages, setMessage] = useState<LogMessage[]>([]);
  useEffect(() => {
    console.log("effect", messages);
    function handleMessage(event: CustomEvent) {
      setMessage((messages) => [...messages, event.detail]);
    }
    document.addEventListener(extensionId, handleMessage);
    return function unsubscribe() {
      document.removeEventListener(extensionId, handleMessage);
    };
  }, []);
  return (
    <div>
      <h3>log</h3>
      <div className={style.log}>
        <table>
          <tbody>
            {messages.map((msg, i) => (
              <tr key={i}>
                <td>{JSON.stringify(msg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
