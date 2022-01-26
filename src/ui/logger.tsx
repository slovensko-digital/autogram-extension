import React from "react";
import { useMessages } from "./internal-messages";
import style from "./style.module.css";

export default function Log() {
  const messages = useMessages();
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
