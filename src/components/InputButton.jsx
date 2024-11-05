import React from "react";
import "./style/InputButton.css";

function InputButton({ label, onClick }) {
  return (
    <button onClick={onClick} className="input-button">
      {label}
    </button>
  );
}

export default InputButton;