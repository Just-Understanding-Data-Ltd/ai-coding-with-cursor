"use client";

import { useState } from "react";

export default function TestPage() {
  const [item, setItem] = useState("");

  return (
    <div>
      <button
        data-testd="lol"
        onClick={() => {
          setItem("sweet");
        }}
      ></button>
      <h1>This is awesome</h1>
      {item}
      <form
        onSubmit={(e: any) => {
          setItem(e.target.value);
        }}
      >
        <input data-testid="awesome" type="text" />
      </form>
      {item}
    </div>
  );
}
