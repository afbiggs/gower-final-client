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





