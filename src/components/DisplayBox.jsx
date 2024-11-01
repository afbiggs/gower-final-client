import React from "react";
import "./style/DisplayBox.css";

function DisplayBox({ label, value }) {
  return (
    <div className="display-container">
      <p className="display-label">{label}</p>
      <div className="display-box">{value}</div>
    </div>
  );
}

export default DisplayBox;
