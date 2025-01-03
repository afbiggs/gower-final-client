import React, { useState, useEffect } from "react";
import EncoderCalibrationKeypad from "./EncoderCalibrationKeypad";
import "./style/EncoderCalibrationPopup.css";

const EncoderCalibrationPopup = ({ onClose, onSubmit, defaultCalibration }) => {
    const [calibration, setCalibration] = useState({
        wheelDiameter: defaultCalibration?.wheelDiameter || 4.0,
        shearDelay: defaultCalibration?.shearDelay || 6.0,
    });
    const [showKeypad, setShowKeypad] = useState(false);
    const [editingField, setEditingField] = useState(null); // Tracks which field is being edited

    useEffect(() => {
        if (defaultCalibration) {
            setCalibration(defaultCalibration);
        }
    }, [defaultCalibration]);

    const handleKeypadSubmit = (value) => {
        const newValue = parseFloat(value);
        if (!isNaN(newValue) && newValue > 0) {
            setCalibration((prev) => ({
                ...prev,
                [editingField]: newValue, // Update the specific field
            }));
        } else {
            alert("Please enter a valid value.");
        }
        setShowKeypad(false);
        setEditingField(null);
    };

    const handleSubmit = () => {
        console.log("Sending Calibration Data:", calibration);
        onSubmit(calibration); // Pass the updated calibration to the parent
        onClose(); // Close the popup
    };

    const handleOverlayClose = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            onClose();
        }
    };

    return (
        <div className="popup-overlay" onClick={handleOverlayClose}>
            <div className="popup-content centered">
                <h3>Calibration</h3>
                <p>Adjust the diameter of the encoder wheel (in inches):</p>
                <input
                    type="text"
                    value={typeof calibration.wheelDiameter === "number" ? calibration.wheelDiameter.toFixed(3) : ""}
                    readOnly
                    onClick={() => {
                        setShowKeypad(true);
                        setEditingField("wheelDiameter");
                    }}
                    className="calibration-input"
                />
                <p>Adjust the shear delay time (in seconds):</p>
                <input
                    type="text"
                    value={typeof calibration.shearDelay === "number" ? calibration.shearDelay.toFixed(2) : ""}
                    readOnly
                    onClick={() => {
                        setShowKeypad(true);
                        setEditingField("shearDelay");
                    }}
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





// import React, { useState, useEffect } from "react";
// import EncoderCalibrationKeypad from "./EncoderCalibrationKeypad";
// import "./style/EncoderCalibrationPopup.css";

// const EncoderCalibrationPopup = ({ onClose, onSubmit, defaultCalibration }) => {
//     const [calibration, setCalibration] = useState({
//         wheelDiameter: defaultCalibration?.wheelDiameter || 4.0,
//         shearDelay: defaultCalibration?.shearDelay || 6.0,
//     });
//     const [showKeypad, setShowKeypad] = useState(false);
//     const [editingField, setEditingField] = useState(null); // Tracks which field is being edited

//     useEffect(() => {
//         if (defaultCalibration) {
//             setCalibration(defaultCalibration);
//         }
//     }, [defaultCalibration]);

//     const handleKeypadSubmit = (value) => {
//         const newValue = parseFloat(value);
//         if (!isNaN(newValue) && newValue > 0) {
//             setCalibration((prev) => ({
//                 ...prev,
//                 [editingField]: newValue, // Update the specific field
//             }));
//         } else {
//             alert("Please enter a valid value.");
//         }
//         setShowKeypad(false);
//         setEditingField(null);
//     };

//     const handleCalibrationSubmit = (calibration) => {
//       console.log("Sending Calibration Data:", calibration);
//       socket.emit('update_calibration', { calibration }); // Send data under `calibration`
//   };
  

//     // const handleSubmit = () => {
//     //     onSubmit(calibration); // Pass the updated calibration to the parent
//     //     onClose();
//     // };

//     const handleOverlayClose = (e) => {
//         if (e.target.classList.contains("popup-overlay")) {
//             onClose();
//         }
//     };

//     return (
//         <div className="popup-overlay" onClick={handleOverlayClose}>
//             <div className="popup-content centered">
//                 <h3>Calibration</h3>
//                 <p>Adjust the diameter of the encoder wheel (in inches):</p>
//                 <input
//                     type="text"
//                     value={typeof calibration.wheelDiameter === 'number' ? calibration.wheelDiameter.toFixed(3) : ''}
//                     readOnly
//                     onClick={() => { setShowKeypad(true); setEditingField('wheelDiameter'); }}
//                     className="calibration-input"
//                 />
//                 <p>Adjust the shear delay time (in seconds):</p>
//                 <input
//                     type="text"
//                     value={typeof calibration.shearDelay === 'number' ? calibration.shearDelay.toFixed(2) : ''}
//                     readOnly
//                     onClick={() => { setShowKeypad(true); setEditingField('shearDelay'); }}
//                     className="calibration-input"
//                 />
//                 <div className="popup-buttons">
//                     <button onClick={handleSubmit} className="popup-submit">
//                         Submit
//                     </button>
//                     <button onClick={onClose} className="popup-cancel">
//                         Cancel
//                     </button>
//                 </div>

//                 {showKeypad && (
//                     <EncoderCalibrationKeypad
//                         onClose={() => setShowKeypad(false)}
//                         onSubmit={handleKeypadSubmit}
//                         allowDecimal={true}
//                     />
//                 )}
//             </div>
//         </div>
//     );
// };

// export default EncoderCalibrationPopup;





// import React, { useState, useEffect } from "react";
// import EncoderCalibrationKeypad from "./EncoderCalibrationKeypad";
// import "./style/EncoderCalibrationPopup.css";

// const EncoderCalibrationPopup = ({ onClose, onSubmit, defaultDiameter, defaultShearDelay }) => {
//   const [wheelDiameter, setWheelDiameter] = useState(defaultDiameter || 4.00); // Initialize with default or fallback value
//   const [shearDelay, setShearDelay] = useState(defaultShearDelay || 6.00); // Initialize shear delay with default or fallback value
//   const [showKeypad, setShowKeypad] = useState(false);
//   const [editingShearDelay, setEditingShearDelay] = useState(false);

//   // Update the local state when the default diameter changes (optional safety check)
//   useEffect(() => {
//     if (defaultDiameter !== undefined) {
//       setWheelDiameter(defaultDiameter);
//     }
//     if (defaultShearDelay !== undefined) {
//       setShearDelay(defaultShearDelay);
//     }
//   }, [defaultDiameter, defaultShearDelay]);

//   const handleKeypadSubmit = (value) => {
//     const newValue = parseFloat(value);
//     if (!isNaN(newValue) && newValue > 0) {
//       if (editingShearDelay) {
//         setShearDelay(newValue); // Update shear delay state
//       } else {
//         setWheelDiameter(newValue); // Update wheel diameter state
//       }
//     } else {
//       alert("Please enter a valid value.");
//     }
//     setShowKeypad(false);
//     setEditingShearDelay(false);
//   };

//   const handleOverlayClose = (e) => {
//     if (e.target.classList.contains("popup-overlay")) {
//       onClose();
//     }
//   };

//   const handleSubmit = () => {
//     onSubmit({ wheelDiameter, shearDelay }); // Pass the updated values to the parent
//     onClose(); // Close the popup
//   };

//   return (
//     <div className="popup-overlay" onClick={handleOverlayClose}>
//       <div className="popup-content">
//         <h3>Encoder Calibration</h3>
//         <p>Adjust the diameter of the encoder wheel (in inches):</p>
//         <input
//           type="text"
//           value={wheelDiameter.toFixed(3)} // Display with 3 decimal precision
//           readOnly
//           onClick={() => { setShowKeypad(true); setEditingShearDelay(false); }}
//           className="calibration-input"
//         />
//         <p>Adjust the shear delay time (in seconds):</p>
//         <input
//           type="text"
//           value={shearDelay.toFixed(2)} // Display with 2 decimal precision
//           readOnly
//           onClick={() => { setShowKeypad(true); setEditingShearDelay(true); }}
//           className="calibration-input"
//         />
//         <div className="popup-buttons">
//           <button onClick={handleSubmit} className="popup-submit">
//             Submit
//           </button>
//           <button onClick={onClose} className="popup-cancel">
//             Cancel
//           </button>
//         </div>

//         {showKeypad && (
//           <EncoderCalibrationKeypad
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





// import React, { useState, useEffect } from "react";
// import EncoderCalibrationKeypad from "./EncoderCalibrationKeypad";
// import "./style/EncoderCalibrationPopup.css";

// const EncoderCalibrationPopup = ({ onClose, onSubmit, defaultDiameter }) => {
//   const [wheelDiameter, setWheelDiameter] = useState(defaultDiameter || 4.00); // Initialize with default or fallback value
//   const [showKeypad, setShowKeypad] = useState(false);

//   // Update the local state when the default diameter changes (optional safety check)
//   useEffect(() => {
//     if (defaultDiameter !== undefined) {
//       setWheelDiameter(defaultDiameter);
//     }
//   }, [defaultDiameter]);

//   const handleKeypadSubmit = (value) => {
//     const newDiameter = parseFloat(value);
//     if (!isNaN(newDiameter) && newDiameter > 0) {
//       setWheelDiameter(newDiameter); // Update local state
//     } else {
//       alert("Please enter a valid diameter.");
//     }
//     setShowKeypad(false);
//   };

//   const handleOverlayClose = (e) => {
//     if (e.target.classList.contains("popup-overlay")) {
//       onClose();
//     }
//   };

//   const handleSubmit = () => {
//     onSubmit(wheelDiameter); // Pass the updated diameter to the parent
//     onClose(); // Close the popup
//   };

//   return (
//     <div className="popup-overlay" onClick={handleOverlayClose}>
//       <div className="popup-content">
//         <h3>Encoder Calibration</h3>
//         <p>Adjust the diameter of the encoder wheel (in inches):</p>
//         <input
//           type="text"
//           value={wheelDiameter.toFixed(3)} // Display with 3 decimal precision
//           readOnly
//           onClick={() => setShowKeypad(true)}
//           className="calibration-input"
//         />
//         <div className="popup-buttons">
//           <button onClick={handleSubmit} className="popup-submit">
//             Submit
//           </button>
//           <button onClick={onClose} className="popup-cancel">
//             Cancel
//           </button>
//         </div>

//         {showKeypad && (
//           <EncoderCalibrationKeypad
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
