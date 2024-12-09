import React, { useState } from "react";
import "./style/EncoderCalibrationKeypad.css";

function EncoderCalibrationKeypad({ onClose, onSubmit, allowDecimal }) {
  const [inputValue, setInputValue] = useState("");

  const handleButtonClick = (value) => {
    if (value === "." && inputValue.includes(".")) return;
    setInputValue((prev) => prev + value);
  };

  const handleClear = () => {
    setInputValue("");
  };

  const handleBackspace = () => {
    setInputValue((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    const numericValue = parseFloat(inputValue);
    if (isNaN(numericValue)) {
      alert("Please enter a valid number.");
      return;
    }
    onSubmit(numericValue);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("keypad-overlay")) {
      onClose();
    }
  };

  return (
    <div className="keypad-overlay" onClick={handleOverlayClick}>
      <div className="keypad">
        <input
          type="text"
          value={inputValue}
          readOnly
          className="keypad-display"
        />
        <div className="keypad-buttons">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num) => (
            <button key={num} onClick={() => handleButtonClick(num)}>
              {num}
            </button>
          ))}
          {allowDecimal && (
            <button onClick={() => handleButtonClick(".")}>.</button>
          )}
          <button onClick={handleBackspace}>⬅︎</button>
          <button onClick={handleClear}>Clear</button>
          <button onClick={handleSubmit}>Enter</button>
        </div>
      </div>
    </div>
  );
}

export default EncoderCalibrationKeypad;
