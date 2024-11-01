import React from "react";
import "./style/InputButton.css";

function InputButton({ label }) {
  return (
    <button className="input-button">{label}</button>
  );
}

export default InputButton;
