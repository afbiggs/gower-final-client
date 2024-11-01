import React from "react";
import "./style/EStopButton.css";

function EStopButton({ label }) {
  return (
    <button className="e-stop-button">{label}</button>
  );
}

export default EStopButton;
