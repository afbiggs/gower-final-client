// import React, { useState } from "react";
// import NumericKeypad from "./NumericKeypad";
// import "./style/EncoderCalibrationPopup.css"; // Optional additional styles

// const EncoderCalibrationPopup = ({ onClose, onSubmit, defaultDiameter }) => {
//   const [wheelDiameter, setWheelDiameter] = useState(defaultDiameter || 1.275); // Default value
//   const [showKeypad, setShowKeypad] = useState(false);

//   const handleKeypadSubmit = (value) => {
//     const diameter = parseFloat(value);
//     if (!isNaN(diameter) && diameter > 0) {
//       setWheelDiameter(diameter); // Update diameter
//     } else {
//       alert("Please enter a valid diameter.");
//     }
//     setShowKeypad(false);
//   };

//   return (
//     <div className="popup-overlay">
//       <div className="popup-content">
//         <h3>Encoder Calibration</h3>
//         <p>Adjust the diameter of the encoder wheel (in inches):</p>
//         <input
//           type="text"
//           value={wheelDiameter}
//           readOnly
//           onClick={() => setShowKeypad(true)}
//           className="calibration-input"
//         />
//         <div className="popup-buttons">
//           <button
//             onClick={() => onSubmit(wheelDiameter)}
//             className="popup-submit"
//           >
//             Submit
//           </button>
//           <button onClick={onClose} className="popup-cancel">
//             Cancel
//           </button>
//         </div>

//         {/* Render the NumericKeypad when needed */}
//         {showKeypad && (
//           <NumericKeypad
//             onClose={() => setShowKeypad(false)}
//             onSubmit={handleKeypadSubmit}
//             allowDecimal={true}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default EncoderCalibrationPopup;
