import React, { useState } from "react";
import "./style/NumericKeypad.css";

function NumericKeypad({onClose, onSubmit}) {
    console.log("NumericKeypad rendered");
    const [inputValue, setInputValue] = useState("");

    const handleButtonClick = (value) => {
        setInputValue((prev) => prev + value);
    };

    const handleClear = () => {
        setInputValue("");
    };

    const handleBackspace = () => {
        setInputValue((prev) => prev.slice(0, -1));
    };

    const handleSubmit = () => {
        onSubmit(inputValue);
        onClose("");
    };

    return (
        <div className="keypad-overlay">
            <div className="keypad">
                <input type="text" value={inputValue} readOnly className="keypad-display" />
                <div className="keypad-buttons">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                        <button key={num} onClick={() => handleButtonClick(num.toString)}>
                            {num}
                        </button>
                    ))}
                    <button onClick={handleBackspace}>⬅︎</button>
                    <button onClick={handleClear}>Clear</button>
                    <button onClick={handleSubmit}>Enter</button>
                 </div>
            </div>
        </div>
    );
}

export default NumericKeypad;
