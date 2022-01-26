import React from "react";
import { resolveValue, Toaster as ToasterOrig } from "react-hot-toast";

export function Toaster() {
  return (
    <ToasterOrig containerStyle={{ position: "relative" }}>
      {(t) => (
        <div
          style={{
            opacity: t.visible ? 1 : 0,
            background: "white",
            padding: 8,
            border: "solid 2px gray",
          }}
        >
          {resolveValue(t.message, t)}
        </div>
      )}
    </ToasterOrig>
  );
}
