import React from "react";
import "./style/ControlButton.css";

function ControlButton({ label, className }) {
  return (
    <button className={`control-button ${className}`}>{label}</button>
  );
}

export default ControlButton;
