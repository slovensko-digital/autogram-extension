import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LogMessage } from "../audit/types";
import { logMessageEventId } from "../constants";

export function useMessages(): LogMessage[] {
  const [messages, setMessage] = useState<LogMessage[]>([]);
  useEffect(() => {
    console.log("effect", messages);
    function handleMessage(event: CustomEvent) {
      setMessage((messages) => [...messages, event.detail]);
      if(event.detail && event.detail.type === "error"){
          toast.error(event.detail.msg);
      }
    }
    document.addEventListener(logMessageEventId, handleMessage);
    return function unsubscribe() {
      document.removeEventListener(logMessageEventId, handleMessage);
    };
  }, []);

  return messages;
}
