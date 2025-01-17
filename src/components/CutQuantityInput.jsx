import React, { useState, useEffect } from "react";
import DisplayBox from "./DisplayBox";
import InputButton from "./InputButton";
import NumericKeypad from "./NumericKeypad";
import "./style/DisplayBox.css";

function CutQuantity({ isLocked, socket, resetTrigger }) {
  const [cutQuantity, setCutQuantity] = useState("");
  const [showKeypad, setShowKeypad] = useState(false);

  useEffect(() => {
    socket.on("updateCutQuantity", (data) => {
      setCutQuantity(data);
    });

    return () => {
      socket.off("updateCutQuantity"); // Cleanup listener
    };
  }, [socket]);

  // Reset cutQuantity when resetTrigger changes
  useEffect(() => {
    setCutQuantity("00000"); // Reset the cut quantity to default
    console.log("Cut Quantity reset.");
  }, [resetTrigger]); // Runs whenever resetTrigger changes


  const handleOpenKeypad = () => {
    if (!isLocked) {
      setShowKeypad(true);
    }
  };

  const handleKeypadSubmit = (value) => {
    setCutQuantity(value);
    socket.emit("setCutQuantity", value);
    setShowKeypad(false);
  };

  return (
    <div className="display-box-container">
      <DisplayBox label="Cut Quantity" value={cutQuantity || "00000"} onClick={handleOpenKeypad} />

      <InputButton
            label="Input Quantity"
            onClick={() => !isLocked && handleOpenKeypad("cutQuantity")}
            disabled={isLocked}
          />

      {showKeypad && (
        <NumericKeypad
          onClose={() => setShowKeypad(false)}
          onSubmit={handleKeypadSubmit}
          allowDecimal={false}
        />
      )}
    </div>
  );
}

export default CutQuantity;
