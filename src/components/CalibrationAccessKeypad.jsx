import React, { useState } from "react";
import "./style/CalibrationAccessKeypad.css";

const CalibrationAccessKeypad = ({ onClose, onAccessGranted }) => {
    const [enteredPin, setEnteredPin] = useState("");
    const correctPin = "1234"; // Change this to your desired PIN

    const handleButtonClick = (value) => {
        if (enteredPin.length < 4) {
            setEnteredPin(enteredPin + value);
        }
    };

    const handleBackspace = () => {
        setEnteredPin(enteredPin.slice(0, -1));
    };

    const handleSubmit = () => {
        if (enteredPin === correctPin) {
            onAccessGranted(); // Open the Calibration Popup
        } else {
            alert("Incorrect PIN. Please try again.");
            setEnteredPin(""); // Reset PIN entry
        }
    };

    return (
        <div className="pin-prompt">
            <h3>Enter Access PIN</h3>
            <div className="pin-display">{enteredPin.replace(/./g, "*") || ""}</div>

            <div className="pin-keypad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                    <button key={num} className="lock-pin-keypad-button" onClick={() => handleButtonClick(num.toString())}>{num}</button>
                ))}
            </div>

            <div className="keypad-actions">
                <button className="keypad-button clear" onClick={handleBackspace}>⌫</button>
                <button className="keypad-button submit" onClick={handleSubmit}>OK</button>
            </div>

            <button onClick={onClose} className="popup-cancel">Cancel</button>
        </div>
    );
};

export default CalibrationAccessKeypad;
