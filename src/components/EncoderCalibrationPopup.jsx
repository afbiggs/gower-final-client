import React, { useState, useEffect } from "react";
import EncoderCalibrationKeypad from "./EncoderCalibrationKeypad";
import "./style/EncoderCalibrationPopup.css";

const EncoderCalibrationPopup = ({ onClose, onSubmit, defaultDiameter }) => {
  const [wheelDiameter, setWheelDiameter] = useState(defaultDiameter || 4.00); // Initialize with default or fallback value
  const [showKeypad, setShowKeypad] = useState(false);

  // Update the local state when the default diameter changes (optional safety check)
  useEffect(() => {
    if (defaultDiameter !== undefined) {
      setWheelDiameter(defaultDiameter);
    }
  }, [defaultDiameter]);

  const handleKeypadSubmit = (value) => {
    const newDiameter = parseFloat(value);
    if (!isNaN(newDiameter) && newDiameter > 0) {
      setWheelDiameter(newDiameter); // Update local state
    } else {
      alert("Please enter a valid diameter.");
    }
    setShowKeypad(false);
  };

  const handleOverlayClose = (e) => {
    if (e.target.classList.contains("popup-overlay")) {
      onClose();
    }
  };

  const handleSubmit = () => {
    onSubmit(wheelDiameter); // Pass the updated diameter to the parent
    onClose(); // Close the popup
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClose}>
      <div className="popup-content">
        <h3>Encoder Calibration</h3>
        <p>Adjust the diameter of the encoder wheel (in inches):</p>
        <input
          type="text"
          value={wheelDiameter.toFixed(3)} // Display with 3 decimal precision
          readOnly
          onClick={() => setShowKeypad(true)}
          className="calibration-input"
        />
        <div className="popup-buttons">
          <button onClick={handleSubmit} className="popup-submit">
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
