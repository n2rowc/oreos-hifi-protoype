import React from "react";
import ReactDOM from "react-dom/client";
import OreosHifiPrototype from "./OreosHifiPrototype.jsx";
import "./index.css";  // <-- this is critical

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <OreosHifiPrototype />
  </React.StrictMode>
);
