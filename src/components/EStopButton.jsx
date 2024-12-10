import React from "react";
import "./style/EStopButton.css";

const EStopButton = ({ isEStopActive, onToggleEStop }) => {
  return (
    <button
      className={`estop-button ${isEStopActive ? "active" : ""}`}
      onClick={onToggleEStop}
    >
      {isEStopActive ? "E-Stop Triggered" : "E-STOP"}
    </button>
  );
};

export default EStopButton;
