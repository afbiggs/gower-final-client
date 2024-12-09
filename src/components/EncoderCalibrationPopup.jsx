import React, { useState } from "react";
import EncoderCalibrationKeypad from "./EncoderCalibrationKeypad";
import "./style/EncoderCalibrationPopup.css";

const EncoderCalibrationPopup = ({ onClose, onSubmit, defaultDiameter }) => {
  const [wheelDiameter, setWheelDiameter] = useState(defaultDiameter || 1.275); // Default value
  const [showKeypad, setShowKeypad] = useState(false);

  const handleKeypadSubmit = (value) => {
    setWheelDiameter(value);
    setShowKeypad(false);
  };

  const handleOverlayClose = (e) => {
    if (e.target.classList.contains("popup-overlay")) {
      onClose();
    }
  };


  return (
    <div className="popup-overlay" onClick={handleOverlayClose}>
      <div className="popup-content">
        <h3>Encoder Calibration</h3>
        <p>Adjust the diameter of the encoder wheel (in inches):</p>
        <input
          type="text"
          value={wheelDiameter.toFixed(3)}
          readOnly
          onClick={() => setShowKeypad(true)}
          className="calibration-input"
        />
        <div className="popup-buttons">
          <button
            onClick={() => onSubmit(wheelDiameter)}
            className="popup-submit"
          >
            Submit
          </button>
          <button onClick={onClose} className="popup-cancel">
            Cancel
          </button>
        </div>

        {showKeypad && (
          <EncoderCalibrationKeypad
            onClose={() => setShowKeypad(false)}
            onSubmit={handleKeypadSubmit}
            allowDecimal={true}
          />
        )}
      </div>
    </div>
  );
};

export default EncoderCalibrationPopup;
