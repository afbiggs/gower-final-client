import React from "react";
import "./style/ScreenLockButton.css";

const ScreenLockButton = ({ isLocked, onToggleLock }) => {
  return (
    <button
      className={`screen-lock-button ${isLocked ? "locked" : ""}`}
      onClick={onToggleLock}
    >
      {isLocked ? "Screen Locked" : "Screen Unlocked"}
    </button>
  );
};

export default ScreenLockButton;
