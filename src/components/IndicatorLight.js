import React from "react";
import "./style/IndicatorLight.css";

function IndicatorLight({ label }) {
  return (
    // <div className="indicator-light">
    <div>
      <div className = "image-container">
        <img src="/images/load-material-icon.png" alt="load-indicator" className="load-material-icon"/>
        <img src="/images/load-material-!.png" alt="overlay" className="load-material-overlay"/>
        <img src="/images/error-icon.png" alt="error-indicator" className="error-icon"/>
        <img src="/images/error-!.png" alt="overlay" className="error-overlay"/>
          <div>
        {/* <div className={`light ${color}`}></div> */}
        <p className="light-label">{label}</p>
        </div>
      </div>
      {/* <div className = "error-indicator">
        <img src="/images/error-icon.png" alt="error-indicator" className="error-icon"/>
        <img src="/images/error-!.png" alt="overlay" className="error-overlay"/>
        {/* <div className={`light ${color}`}></div> */}
       
      
    </div> 
  );
}

export default IndicatorLight;
