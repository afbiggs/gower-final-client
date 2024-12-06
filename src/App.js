import './index.css';
import './App.css';
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import DisplayBox from "./components/DisplayBox.jsx";
import InputButton from "./components/InputButton.jsx";
import ControlButton from "./components/ControlButton.jsx";
import IndicatorLight from "./components/IndicatorLight.js";
import NumericKeypad from "./components/NumericKeypad.jsx";
import ConfirmationDialog from './components/ConfirmationDialog.jsx';

const socket = io('http://192.168.1.228:4300');

function App() {
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [cutLength, setCutLength] = useState("000.000");
  const [cutQuantity, setCutQuantity] = useState("00000");
  const [cutCount, setCutCount] = useState(0);
  const [cutCycleTime, setCutCycleTime] = useState("000.00");
  const [liveCutFeed, setLiveCutFeed] = useState(0);
  const [showKeypad, setShowKeypad] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeInput, setActiveInput] = useState(null);
  const [isRunning, setIsRunning] = useState(false); // Track if motor is running
  const [isPaused, setIsPaused] = useState(false); // Track if motor is paused


  const handleOpenKeypad = (inputType) => {
    setActiveInput(inputType);
    setShowKeypad(true);
  };

  const handleKeypadSubmit = (value) => {
    setInputValue(value);
    setShowKeypad(false);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (activeInput === "cutLength") {
      setCutLength(inputValue);
    } else if (activeInput === "cutQuantity") {
      setCutQuantity(inputValue.padStart(5, '0'));
    }
    setShowConfirmation(false);
    setActiveInput(null);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setInputValue("");
    setActiveInput(null);
  };


  const handleStartPause = () => {
    if (!isRunning && !isPaused) {
      // Starting the motor for the first time
      const data = {
        cutLength: parseFloat(cutLength),
        cutQuantity: parseInt(cutQuantity, 10),
      };
  
      // Send cut parameters to the server
      socket.emit("set_cut_parameters", data, (ack) => {
        if (ack && ack.error) {
          console.error("Error sending cut parameters:", ack.error);
        } else {
          console.log("Cut parameters sent to server:", data);
        }
      });
  
      // Start the motor
      socket.emit("start_motor", (ack) => {
        if (ack && ack.error) {
          console.error("Error starting motor:", ack.error);
        } else {
          console.log("Motor started.");
        }
      });
  
      setIsRunning(true);
      setIsPaused(false);
    } else if (isRunning && !isPaused) {
      // Pausing the motor
      socket.emit("pause_motor", (ack) => {
        if (ack && ack.error) {
          console.error("Error pausing motor:", ack.error);
        } else {
          console.log("Motor paused.");
        }
      });
  
      setIsRunning(false);
      setIsPaused(true);
    } else if (!isRunning && isPaused) {
      // Resuming the motor
      socket.emit("resume_motor", (ack) => {
        if (ack && ack.error) {
          console.error("Error resuming motor:", ack.error);
        } else {
          console.log("Motor resumed.");
        }
      });
  
      setIsRunning(true);
      setIsPaused(false);
    }
  };
  


  // const handleStartPause = () => {
  //   if (!isRunning) {
  //     // Starting the motor
  //     const data = {
  //       cutLength: parseFloat(cutLength),
  //       cutQuantity: parseInt(cutQuantity, 10),
  //     };
  
  //     // Send cut parameters to the server
  //     socket.emit("set_cut_parameters", data, (ack) => {
  //       if (ack && ack.error) {
  //         console.error("Error sending cut parameters:", ack.error);
  //       } else {
  //         console.log("Cut parameters sent to server:", data);
  //       }
  //     });
  
  //     // Start the motor
  //     socket.emit("start_motor", (ack) => {
  //       if (ack && ack.error) {
  //         console.error("Error starting motor:", ack.error);
  //       } else {
  //         console.log("Motor started.");
  //       }
  //     });
  //   } else {
  //     // Pausing the motor
  //     socket.emit("pause_motor", (ack) => {
  //       if (ack && ack.error) {
  //         console.error("Error pausing motor:", ack.error);
  //       } else {
  //         console.log("Motor paused.");
  //       }
  //     });
  //   }
  
  //   // Toggle between running and paused states
  //   setIsRunning(!isRunning);
  // };
  

  // // Start or Pause functionality
  // const handleStartPause = () => {
  //   if (!isRunning) {
  //     // Send cut parameters and start motor
  //     const data = {
  //       cutLength: parseFloat(cutLength),
  //       cutQuantity: parseInt(cutQuantity, 10),
  //     };
  //     socket.emit("set_cut_parameters", data); // Emit parameters to server
  //     console.log('Cut parameters sent to server:', data);
  //     socket.emit("start_motor"); // Start the motor
  //     console.log('Motor started.');
  //   } else {
  //     // Pause the motor
  //     socket.emit("pause_motor");
  //     console.log('Motor paused.');
  
  //     // Turn off Material Forward Relay when paused
  //     socket.emit("material_forward_control", "OFF");
  //     console.log("Material Forward Relay: OFF");
  //   }
  //   setIsRunning(!isRunning); // Toggle between running and paused states
  // };
  
  const handleReset = () => {
    setShowResetConfirmation(true);
  };

  const confirmReset = () => {
    // Send reset command to the server to ensure relays turn off after completing the current cut
    socket.emit("confirm_reset", { action: "reset" });
  
    console.log("Reset command sent to ESP32");
  
    // Update UI state
    setCutLength("000.000");
    setCutQuantity("00000");
    setCutCount("0000");
    setLiveCutFeed(0);
    setIsRunning(false); // Reset running state
    setShowResetConfirmation(false);
  };
  


  // const confirmReset = () => {
  //   // socket.emit("reset_encoder");
  //   // console.log('Encoder reset');
  //   setCutLength("000.000");
  //   setCutQuantity("00000");
  //   setCutCount("0000");
  //   setLiveCutFeed(0);
  //   setIsRunning(false); // Reset running state
  //   setShowResetConfirmation(false);
  // };

  const cancelReset = () => {
    setShowResetConfirmation(false);
  };

  // const handleMaterialForwardPress = () => {
  //   socket.emit("material_forward_control", { materialForward: "ON" });
  //   console.log("Material Forward ON");
  // };
  
  // const handleMaterialForwardRelease = () => {
  //   socket.emit("material_forward_control", { materialForward: "OFF" });
  //   console.log("Material Forward OFF");
  // };
  

  const handleMaterialForwardPress = () => {
    socket.emit("material_forward_control", "ON");
    console.log("Material Forward: ON");
  };

  // Handle Material Forward release
  const handleMaterialForwardRelease = () => {
    socket.emit("material_forward_control", "OFF");
    console.log("Material Forward: OFF");
  };

  const handleManualShearPress = () => {
    socket.emit("manual_shear_control", "ON");
    console.log("Manual Shear: ON");
  };

  const handleManualShearRelease = () => {
    socket.emit("manual_shear_control", "OFF");
    console.log("Manual Shear: OFF");
  };

  useEffect(() => {
    socket.on("connect", () => {
      setConnectionStatus("Connected");
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("Disconnected");
      console.log("Disconnected from server");
    });

    socket.on("cut_status", (data) => {
      console.log("Received cut_status:", data);
      if (data.cutCount !== undefined) {
        setCutCount(data.cutCount);
        setCutQuantity((prevQuantity) => {
          const newQuantity = parseInt(prevQuantity, 10) - 1;
          return newQuantity > 0 ? newQuantity.toString().padStart(5, '0') : "00000";
        });
      }
    });

    socket.on('travel_distance', (data) => {
      if (data.travelDistance !== undefined) {
        setLiveCutFeed(Number(data.travelDistance));
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("cut_status");
      socket.off("travel_distance");
    };
  }, [cutLength]);

  return (
    <div className="app">
      <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>

      <div className="cut-data-section"> 
        <div className="display-box-container">
          <label className="display-label">Cut Length</label>
          <div className="display-box">
            <input type="text" className="display-input" value={cutLength} readOnly />
          </div>
          <InputButton label="Input Length" onClick={() => handleOpenKeypad("cutLength")} />
        </div>
        
        <div className="display-box-container">
          <label className="display-label">Cut Quantity</label>
          <div className="display-box">
            <input type="text" className="display-input" value={cutQuantity} readOnly />
          </div>
          <InputButton label="Input Quantity" onClick={() => handleOpenKeypad("cutQuantity")} />
        </div>
      </div>

      {showKeypad && (
        <NumericKeypad 
          onClose={() => setShowKeypad(false)} 
          onSubmit={handleKeypadSubmit} 
          allowDecimal={activeInput === "cutLength"}
        />
      )}

      {showConfirmation && (
        <ConfirmationDialog
          value={inputValue}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {showResetConfirmation && (
        <ConfirmationDialog
          value="Are you sure you want to reset the input values to 0?"
          onConfirm={confirmReset}
          onCancel={cancelReset}
        />
      )}
    
      <div className="display-section">
        <DisplayBox label="Cut Count" value={cutCount.toString().padStart(5, '0')} />
        <DisplayBox label="Cut Cycle Time" value={String(cutCycleTime).padStart(6, '0')} />
        <DisplayBox label="Live Cut Feed" value={liveCutFeed.toFixed(3).toString().padStart(7, '0')}/>
      </div>

      <div className="control-section">
        <div className="control-column">
          <button className="control-button" onClick={handleStartPause}>
            {!isRunning && !isPaused ? "Start" : isRunning ? "Pause" : "Resume"}
          </button>

          <button className="control-button" onClick={handleReset}>Reset</button>
          <button className="control-button blue-button">Encoder<br />Calibration</button>
        </div>
        <div className="control-column">
          <button 
            className="control-button" 
            onMouseDown={handleMaterialForwardPress} 
            onMouseUp={handleMaterialForwardRelease}
            onTouchStart={handleMaterialForwardPress} 
            onTouchEnd={handleMaterialForwardRelease}
          >
            Material Forward
          </button>
          <button className="control-button"
            onMouseDown={handleManualShearPress}
            onMouseUp={handleManualShearRelease}
          >Manual Shear
          </button>
          <button className="control-button">Screen Unlocked</button>
          <div className="image-container">
            <IndicatorLight label="Load Material" color="yellow" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;







// import './index.css';
// import './App.css';
// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import DisplayBox from "./components/DisplayBox.jsx";
// import InputButton from "./components/InputButton.jsx";
// import ControlButton from "./components/ControlButton.jsx";
// import IndicatorLight from "./components/IndicatorLight.js";
// import NumericKeypad from "./components/NumericKeypad.jsx";
// import ConfirmationDialog from './components/ConfirmationDialog.jsx';

// const socket = io('http://192.168.1.228:4300');

// function App() {
//   const [connectionStatus, setConnectionStatus] = useState("Disconnected");
//   const [cutLength, setCutLength] = useState("000.000");
//   const [cutQuantity, setCutQuantity] = useState("00000");
//   const [cutCount, setCutCount] = useState(0);
//   const [cutCycleTime, setCutCycleTime] = useState("000.00");
//   const [liveCutFeed, setLiveCutFeed] = useState(0);
//   const [showKeypad, setShowKeypad] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [showResetConfirmation, setShowResetConfirmation] = useState(false);
//   const [inputValue, setInputValue] = useState("");
//   const [activeInput, setActiveInput] = useState(null);

//   const handleOpenKeypad = (inputType) => {
//     setActiveInput(inputType);
//     setShowKeypad(true);
//   };

//   const handleKeypadSubmit = (value) => {
//     setInputValue(value);
//     setShowKeypad(false);
//     setShowConfirmation(true);
//   };

//   const handleConfirm = () => {
//     if (activeInput === "cutLength") {
//       setCutLength(inputValue);
//     } else if (activeInput === "cutQuantity") {
//       setCutQuantity(inputValue.padStart(5, '0'));
//     }
//     setShowConfirmation(false);
//     setActiveInput(null);
//   };

//   const handleCancel = () => {
//     setShowConfirmation(false);
//     setInputValue("");
//     setActiveInput(null);
//   };

//   const handleStart = () => {
//     const data = {
//       cutLength: parseFloat(cutLength),
//       cutQuantity: parseInt(cutQuantity, 10)
//     };
//     socket.emit("set_cut_parameters", data);
//     console.log('Parameters sent to server:', data);
//   };

//   const handleReset = () => {
//     setShowResetConfirmation(true);
//   };

//   const confirmReset = () => {
//     socket.emit("reset_encoder");
//     console.log('Encoder reset');
//     setCutLength("000.000");
//     setCutQuantity("00000");
//     setCutCount("0000");
//     setLiveCutFeed(0);
//     setShowResetConfirmation(false);
//   };

//   const cancelReset = () => {
//     setShowResetConfirmation(false);
//   };

//   const handleMaterialForwardPress = () => {
//     socket.emit("material_forward_control", "ON");
//     console.log("Material Forward: ON");
//   };

//   const handleMaterialForwardRelease = () => {
//     socket.emit("material_forward_control", "OFF");
//     console.log("Material Forward: OFF");
//   };

//   const handleManualShearPress = () => {
//     socket.emit("manual_shear_control", "ON");
//     console.log("Manual Shear: ON");
//   };

//   const handleManualShearRelease = () => {
//     socket.emit("manual_shear_control", "OFF");
//     console.log("Manual Shear: OFF");
//   };

//   useEffect(() => {
//     socket.on("connect", () => {
//       setConnectionStatus("Connected");
//       console.log("Connected to server");
//     });

//     socket.on("disconnect", () => {
//       setConnectionStatus("Disconnected");
//       console.log("Disconnected from server");
//     });

//     socket.on("cut_status", (data) => {
//       console.log("Received cut_status:", data);
//       if (data.cutCount !== undefined) {
//         setCutCount(data.cutCount);
//         setCutQuantity((prevQuantity) => {
//           const newQuantity = parseInt(prevQuantity, 10) - 1;
//           return newQuantity > 0 ? newQuantity.toString().padStart(5, '0') : "00000";
//         });
//       }
//     });

//       // Listen for travel_distance updates
//       socket.on('travel_distance', (data) => {
//           if (data.travelDistance !== undefined) {
//               // Parse the travelDistance as a number to avoid type issues
//               setLiveCutFeed(Number(data.travelDistance))
//       }
//   });

//   // Cleanup event listeners on component unmount
//   return () => {
//       socket.off("connect");
//       socket.off("disconnect");
//       socket.off("cut_status");
//       socket.off("travel_distance");
//   };
// }, [cutLength]); // Dependency on cutLength to ensure accurate resets


//   //   return () => {
//   //     socket.off("connect");
//   //     socket.off("disconnect");
//   //     socket.off("cut_status");
//   //   };
//   // }, []);

//   return (
//     <div className="app">
//       <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>

//       <div className="cut-data-section"> 
//         <div className="display-box-container">
//           <label className="display-label">Cut Length</label>
//           <div className="display-box">
//             <input type="text" className="display-input" value={cutLength} readOnly />
//           </div>
//           <InputButton label="Input Length" onClick={() => handleOpenKeypad("cutLength")} />
//         </div>
        
//         <div className="display-box-container">
//           <label className="display-label">Cut Quantity</label>
//           <div className="display-box">
//             <input type="text" className="display-input" value={cutQuantity} readOnly />
//           </div>
//           <InputButton label="Input Quantity" onClick={() => handleOpenKeypad("cutQuantity")} />
//         </div>
//       </div>

//       {showKeypad && (
//         <NumericKeypad 
//           onClose={() => setShowKeypad(false)} 
//           onSubmit={handleKeypadSubmit} 
//           allowDecimal={activeInput === "cutLength"}
//         />
//       )}

//       {showConfirmation && (
//         <ConfirmationDialog
//           value={inputValue}
//           onConfirm={handleConfirm}
//           onCancel={handleCancel}
//         />
//       )}

//       {showResetConfirmation && (
//         <ConfirmationDialog
//           value="Are you sure you want to reset the input values to 0?"
//           onConfirm={confirmReset}
//           onCancel={cancelReset}
//         />
//       )}
    
//       <div className="display-section">
//         <DisplayBox label="Cut Count" value={cutCount.toString().padStart(5, '0')} />
//         <DisplayBox label="Cut Cycle Time" value={String(cutCycleTime).padStart(6, '0')} />
//         <DisplayBox label="Live Cut Feed" value={liveCutFeed.toFixed(3).toString().padStart(7, '0')}/>
//       </div>

//       <div className="control-section">
//         <div className="control-column">
//           <button className="control-button" onClick={handleStart}>Start</button>
//           <button className="control-button" onClick={handleReset}>Reset</button>
//           <button className="control-button blue-button">Encoder<br />Calibration</button>
//         </div>
//         <div className="control-column">
//           <button 
//             className="control-button" 
//             onMouseDown={handleMaterialForwardPress} 
//             onMouseUp={handleMaterialForwardRelease}
//             onTouchStart={handleMaterialForwardPress} 
//             onTouchEnd={handleMaterialForwardRelease}
//           >
//             Material Forward
//           </button>
//           <button className="control-button"
//             onMouseDown={handleManualShearPress}
//             onMouseUp={handleManualShearRelease}
//           >Manual Shear
//           </button>
//           <button className="control-button">Screen Unlocked</button>
//           <div className="image-container">
//             <IndicatorLight label="Load Material" color="yellow" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;








// import './index.css';
// import './App.css';
// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import DisplayBox from "./components/DisplayBox.jsx";
// import InputButton from "./components/InputButton.jsx";
// import ControlButton from "./components/ControlButton.jsx";
// import IndicatorLight from "./components/IndicatorLight.js";
// import NumericKeypad from "./components/NumericKeypad.jsx";
// import ConfirmationDialog from './components/ConfirmationDialog.jsx';

// const socket = io('http://192.168.1.228:4300');

// function App() {
//   const [connectionStatus, setConnectionStatus] = useState("Disconnected");
//   const [cutLength, setCutLength] = useState("000.000");
//   const [cutQuantity, setCutQuantity] = useState("00000");
//   const [cutCount, setCutCount] = useState(0);
//   const [cutCycleTime, setCutCycleTime] = useState("000.00");
//   const [liveCutFeed, setLiveCutFeed] = useState(0);
//   const [showKeypad, setShowKeypad] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [showResetConfirmation, setShowResetConfirmation] = useState(false);
//   const [inputValue, setInputValue] = useState("");
//   const [activeInput, setActiveInput] = useState(null);
//   const [isPaused, setIsPaused] = useState(false); // State to track paused state


//   const handleOpenKeypad = (inputType) => {
//     setActiveInput(inputType);
//     setShowKeypad(true);
//   };

//   const handleKeypadSubmit = (value) => {
//     setInputValue(value);
//     setShowKeypad(false);
//     setShowConfirmation(true);
//   };

//   const handleConfirm = () => {
//     if (activeInput === "cutLength") {
//       setCutLength(inputValue);
//     } else if (activeInput === "cutQuantity") {
//       setCutQuantity(inputValue.padStart(5, '0'));
//     }
//     setShowConfirmation(false);
//     setActiveInput(null);
//   };

//   const handleCancel = () => {
//     setShowConfirmation(false);
//     setInputValue("");
//     setActiveInput(null);
//   };

//   const handleStartPause = () => {
//     if (isPaused) {
//       // Resume logic
//       socket.emit("feed_motor", { action: "resume" });
//       console.log("Resuming feed motor...");
//     } else {
//       // Pause logic
//       socket.emit("feed_motor", { action: "pause" });
//       console.log("Pausing feed motor...");
//     }
//     setIsPaused(!isPaused); // Toggle the button state
//   };

//   // const handleStart = () => {
//   //   const data = {
//   //     cutLength: parseFloat(cutLength),
//   //     cutQuantity: parseInt(cutQuantity, 10)
//   //   };
//   //   socket.emit("set_cut_parameters", data);
//   //   console.log('Parameters sent to server:', data);
//   // };

//   const handleReset = () => {
//     setShowResetConfirmation(true);
//   };

//   const confirmReset = () => {
//     socket.emit("reset_encoder");
//     console.log('Encoder reset');
//     setCutLength("000.000");
//     setCutQuantity("00000");
//     setCutCount("0000");
//     setLiveCutFeed(0);
//     setShowResetConfirmation(false);
//   };

//   const cancelReset = () => {
//     setShowResetConfirmation(false);
//   };

//   const handleMaterialForwardPress = () => {
//     socket.emit("material_forward_control", "ON");
//     console.log("Material Forward: ON");
//   };

//   const handleMaterialForwardRelease = () => {
//     socket.emit("material_forward_control", "OFF");
//     console.log("Material Forward: OFF");
//   };

//   const handleManualShearPress = () => {
//     socket.emit("manual_shear_control", "ON");
//     console.log("Manual Shear: ON");
//   };

//   const handleManualShearRelease = () => {
//     socket.emit("manual_shear_control", "OFF");
//     console.log("Manual Shear: OFF");
//   };

//   useEffect(() => {
//     socket.on("connect", () => {
//       setConnectionStatus("Connected");
//       console.log("Connected to server");
//     });

//     socket.on("disconnect", () => {
//       setConnectionStatus("Disconnected");
//       console.log("Disconnected from server");
//     });

//     socket.on("cut_status", (data) => {
//       console.log("Received cut_status:", data);
//       if (data.cutCount !== undefined) {
//         setCutCount(data.cutCount);
//         setCutQuantity((prevQuantity) => {
//           const newQuantity = parseInt(prevQuantity, 10) - 1;
//           return newQuantity > 0 ? newQuantity.toString().padStart(5, '0') : "00000";
//         });
//       }
//     });

//       // Listen for travel_distance updates
//       socket.on('travel_distance', (data) => {
//           if (data.travelDistance !== undefined) {
//               // Parse the travelDistance as a number to avoid type issues
//               setLiveCutFeed(Number(data.travelDistance))
//       }
//   });

//   // Cleanup event listeners on component unmount
//   return () => {
//       socket.off("connect");
//       socket.off("disconnect");
//       socket.off("cut_status");
//       socket.off("travel_distance");
//   };
// }, [cutLength]); // Dependency on cutLength to ensure accurate resets


//   //   return () => {
//   //     socket.off("connect");
//   //     socket.off("disconnect");
//   //     socket.off("cut_status");
//   //   };
//   // }, []);

//   return (
//     <div className="app">
//       <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>

//       <div className="cut-data-section"> 
//         <div className="display-box-container">
//           <label className="display-label">Cut Length</label>
//           <div className="display-box">
//             <input type="text" className="display-input" value={cutLength} readOnly />
//           </div>
//           <InputButton label="Input Length" onClick={() => handleOpenKeypad("cutLength")} />
//         </div>
        
//         <div className="display-box-container">
//           <label className="display-label">Cut Quantity</label>
//           <div className="display-box">
//             <input type="text" className="display-input" value={cutQuantity} readOnly />
//           </div>
//           <InputButton label="Input Quantity" onClick={() => handleOpenKeypad("cutQuantity")} />
//         </div>
//       </div>

//       {showKeypad && (
//         <NumericKeypad 
//           onClose={() => setShowKeypad(false)} 
//           onSubmit={handleKeypadSubmit} 
//           allowDecimal={activeInput === "cutLength"}
//         />
//       )}

//       {showConfirmation && (
//         <ConfirmationDialog
//           value={inputValue}
//           onConfirm={handleConfirm}
//           onCancel={handleCancel}
//         />
//       )}

//       {showResetConfirmation && (
//         <ConfirmationDialog
//           value="Are you sure you want to reset the input values to 0?"
//           onConfirm={confirmReset}
//           onCancel={cancelReset}
//         />
//       )}
    
//       <div className="display-section">
//         <DisplayBox label="Cut Count" value={cutCount.toString().padStart(5, '0')} />
//         <DisplayBox label="Cut Cycle Time" value={String(cutCycleTime).padStart(6, '0')} />
//         <DisplayBox label="Live Cut Feed" value={liveCutFeed.toFixed(3).toString().padStart(7, '0')}/>
//       </div>

//       <div className="control-section">
//         <div className="control-column">
//           <button 
//             className="control-button" 
//             onClick={handleStartPause}
//             style={{ backgroundColor: isPaused ? "orange" : "green" }}
//           >
//             {isPaused ? "Pause" : "Start"}
//           </button>
//           <button className="control-button" onClick={handleReset}>Reset</button>
//           <button className="control-button blue-button">Encoder<br />Calibration</button>
//         </div>
//         <div className="control-column">
//           <button 
//             className="control-button" 
//             onMouseDown={handleMaterialForwardPress} 
//             onMouseUp={handleMaterialForwardRelease}
//             onTouchStart={handleMaterialForwardPress} 
//             onTouchEnd={handleMaterialForwardRelease}
//           >
//             Material Forward
//           </button>
//           <button className="control-button"
//             onMouseDown={handleManualShearPress}
//             onMouseUp={handleManualShearRelease}
//           >Manual Shear
//           </button>
//           <button className="control-button">Screen Unlocked</button>
//           <div className="image-container">
//             <IndicatorLight label="Load Material" color="yellow" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;


//   return (
//     <div className="app">
//       <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>

//       <div className="cut-data-section"> 
//         <div className="display-box-container">
//           <label className="display-label">Cut Length</label>
//           <div className="display-box">
//             <input type="text" className="display-input" value={cutLength} readOnly />
//           </div>
//           <InputButton label="Input Length" onClick={() => handleOpenKeypad("cutLength")} />
//         </div>
        
//         <div className="display-box-container">
//           <label className="display-label">Cut Quantity</label>
//           <div className="display-box">
//             <input type="text" className="display-input" value={cutQuantity} readOnly />
//           </div>
//           <InputButton label="Input Quantity" onClick={() => handleOpenKeypad("cutQuantity")} />
//         </div>
//       </div>

//       {showKeypad && (
//         <NumericKeypad 
//           onClose={() => setShowKeypad(false)} 
//           onSubmit={handleKeypadSubmit} 
//           allowDecimal={activeInput === "cutLength"}
//         />
//       )}

//       {showConfirmation && (
//         <ConfirmationDialog
//           value={inputValue}
//           onConfirm={handleConfirm}
//           onCancel={handleCancel}
//         />
//       )}

//       {showResetConfirmation && (
//         <ConfirmationDialog
//           value="Are you sure you want to reset the input values to 0?"
//           onConfirm={confirmReset}
//           onCancel={cancelReset}
//         />
//       )}
    
//       <div className="display-section">
//         <DisplayBox label="Cut Count" value={cutCount.toString().padStart(5, '0')} />
//         <DisplayBox label="Cut Cycle Time" value={String(cutCycleTime).padStart(6, '0')} />
//         <DisplayBox label="Live Cut Feed" value={liveCutFeed.toFixed(3).toString().padStart(7, '0')}/>
//       </div>

//       <div className="control-section">
//         <div className="control-column">
//           <button className="control-button" onClick={handleStart}>Start</button>
//           <button className="control-button" onClick={handleReset}>Reset</button>
//           <button className="control-button blue-button">Encoder<br />Calibration</button>
//         </div>
//         <div className="control-column">
//           <button 
//             className="control-button" 
//             onMouseDown={handleMaterialForwardPress} 
//             onMouseUp={handleMaterialForwardRelease}
//             onTouchStart={handleMaterialForwardPress} 
//             onTouchEnd={handleMaterialForwardRelease}
//           >
//             Material Forward
//           </button>
//           <button className="control-button"
//             onMouseDown={handleManualShearPress}
//             onMouseUp={handleManualShearRelease}
//           >Manual Shear
//           </button>
//           <button className="control-button">Screen Unlocked</button>
//           <div className="image-container">
//             <IndicatorLight label="Load Material" color="yellow" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;








// import './index.css';
// import './App.css';
// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import DisplayBox from "./components/DisplayBox.jsx";
// import InputButton from "./components/InputButton.jsx";
// import ControlButton from "./components/ControlButton.jsx";
// import IndicatorLight from "./components/IndicatorLight.js";
// // import EStopButton from "./components/EStopButton.jsx";
// import NumericKeypad from "./components/NumericKeypad.jsx";
// import ConfirmationDialog from './components/ConfirmationDialog.jsx';

// const socket = io('http://192.168.1.185:4300');

// function App() {
//   const [connectionStatus, setConnectionStatus] = useState("Disconnected");
//   const [cutLength, setCutLength] = useState("000.000");
//   const [cutQuantity, setCutQuantity] = useState("00000");
//   const [cutCount, setCutCount] = useState(0);
//   const [cutCycleTime, setCutCycleTime] = useState("000.00");
//   const [liveCutFeed, setLiveCutFeed] = useState("000.000");
//   const [showKeypad, setShowKeypad] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [showResetConfirmation, setShowResetConfirmation] = useState(false);
//   const [inputValue, setInputValue] = useState("");
//   const [activeInput, setActiveInput] = useState(null);

//   // Open the keypad for input
//   const handleOpenKeypad = (inputType) => {
//     setActiveInput(inputType);
//     setShowKeypad(true);
//   };

//   // Handle keypad submission
//   const handleKeypadSubmit = (value) => {
//     setInputValue(value);
//     setShowKeypad(false);
//     setShowConfirmation(true);
//   };

//   // Confirm and update parameters
//   const handleConfirm = () => {
//     if (activeInput === "cutLength") {
//       setCutLength(inputValue);
//     } else if (activeInput === "cutQuantity") {
//       setCutQuantity(inputValue);
//     }
//     setShowConfirmation(false);
//     setActiveInput(null);
//   };

//   const handleCancel = () => {
//     setShowConfirmation(false);
//     setInputValue("");
//     setActiveInput(null);
//   };

//   // Send cut parameters to the server
//   const handleStart = () => {
//     const data = {
//       cutLength: parseFloat(cutLength),
//       cutQuantity: parseInt(cutQuantity, 10)
//     };
//     socket.emit("set_cut_parameters", data);
//     console.log('Parameters sent to server:', data);
//   };

//   const handleReset = () => {
//     setShowResetConfirmation(true);
//   };

//   const confirmReset = () => {
//     socket.emit("reset_encoder");
//     console.log('Encoder reset');
//     setCutLength("000.000");
//     setCutQuantity("00000");
//     setShowResetConfirmation(false);
//   };

//   const cancelReset = () => {
//     setShowResetConfirmation(false);
//   };

//   // Handle Material Forward press
//   const handleMaterialForwardPress = () => {
//     socket.emit("material_forward_control", "ON");
//     console.log("Material Forward: ON");
//   };

//   // Handle Material Forward release
//   const handleMaterialForwardRelease = () => {
//     socket.emit("material_forward_control", "OFF");
//     console.log("Material Forward: OFF");
//   };

//   const handleManualShearPress = () => {
//     socket.emit("manual_shear_control", "ON");
//     console.log("Manual Shear: ON");
//   };

//   const handleManualShearRelease = () => {
//     socket.emit("manual_shear_control", "OFF");
//     console.log("Manual Shear: OFF");
//   };

//   // Socket.IO event listeners
//   useEffect(() => {
//     socket.on("connect", () => {
//         setConnectionStatus("Connected");
//         console.log("Connected to server");
//     });

//     socket.on("disconnect", () => {
//         setConnectionStatus("Disconnected");
//         console.log("Disconnected from server");
//     });

//     // Listen for cut_status events from the server
//     socket.on("cut_status", (data) => {
//         console.log("Received cut_status:", data);
//         if (data.cutCount !== undefined) {
//             setCutCount(data.cutCount);
//         }
//     });

//     // Cleanup event listeners on component unmount
//     return () => {
//         socket.off("connect");
//         socket.off("disconnect");
//         socket.off("cut_status");
//     };
// }, []);

//   return (
//     <div className="app">
//       <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>
      
//       <div className="cut-data-section"> 
//         <div className="display-box-container">
//           <label className="display-label">Cut Length</label>
//           <div className="display-box">
//             <input type="text" className="display-input" value={cutLength} readOnly />
//           </div>
//           <InputButton label="Input Length" onClick={() => handleOpenKeypad("cutLength")} />
//         </div>
        
//         <div className="display-box-container">
//           <label className="display-label">Cut Quantity</label>
//           <div className="display-box">
//             <input type="text" className="display-input" value={cutQuantity} readOnly />
//           </div>
//           <InputButton label="Input Quantity" onClick={() => handleOpenKeypad("cutQuantity")} />
//         </div>
//       </div>

//       {showKeypad && (
//         <NumericKeypad 
//           onClose={() => setShowKeypad(false)} 
//           onSubmit={handleKeypadSubmit} 
//           allowDecimal={activeInput === "cutLength"}
//         />
//       )}

//       {showConfirmation && (
//         <ConfirmationDialog
//           value={inputValue}
//           onConfirm={handleConfirm}
//           onCancel={handleCancel}
//         />
//       )}

//       {showResetConfirmation && (
//         <ConfirmationDialog
//           value="Are you sure you want to reset the input values to 0?"
//           onConfirm={confirmReset}
//           onCancel={cancelReset}
//         />
//       )}
    
//       <div className="display-section">
//         <DisplayBox label="Cut Count" value={cutCount.toString().padStart(5, '0')} />
//         <DisplayBox label="Cut Cycle Time" value={String(cutCycleTime).padStart(6, '0')} />
//         <DisplayBox label="Live Cut Feed" value={String(liveCutFeed).padStart(7, '0')} />
//       </div>

//       <div className="control-section">
//         <div className="control-column">
//           <button className="control-button" onClick={handleStart}>Start</button>
//           <button className="control-button" onClick={handleReset}>Reset</button>
//           <button className="control-button blue-button">Encoder<br />Calibration</button>
//         </div>
//         <div className="control-column">
//           <button 
//             className="control-button" 
//             onMouseDown={handleMaterialForwardPress} 
//             onMouseUp={handleMaterialForwardRelease}
//             onTouchStart={handleMaterialForwardPress} 
//             onTouchEnd={handleMaterialForwardRelease}
//           >
//             Material Forward
//           </button>
//           <button className="control-button"
//             onMouseDown={handleManualShearPress}
//             onMouseUp={handleManualShearRelease}
//           >Manual Shear
//           </button>
//           <button className="control-button">Screen Unlocked</button>
//           <div className="image-container">
//             <IndicatorLight label="Load Material" color="yellow" />
//           </div>
//           {/* <EStopButton label="E Stop" /> */}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;













// import './index.css';
// import './App.css';
// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import DisplayBox from "./components/DisplayBox.jsx";
// import InputButton from "./components/InputButton.jsx";
// import ControlButton from "./components/ControlButton.jsx";
// import IndicatorLight from "./components/IndicatorLight.js";
// import EStopButton from "./components/EStopButton.jsx";
// import NumericKeypad from "./components/NumericKeypad.jsx";
// import ConfirmationDialog from './components/ConfirmationDialog.jsx';

// const socket = io('http://192.168.8.214:4300');

// function App() {
//   const [connectionStatus, setConnectionStatus] = useState("Disconnected");
//   const [cutLength, setCutLength] = useState("000.000");
//   const [cutQuantity, setCutQuantity] = useState("00000");
//   const [cutCount, setCutCount] = useState(0);
//   const [cutCycleTime, setCutCycleTime] = useState("000.00");
//   const [liveCutFeed, setLiveCutFeed] = useState("000.000");
//   const [showKeypad, setShowKeypad] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [showResetConfirmation, setShowResetConfirmation] = useState(false);
//   const [inputValue, setInputValue] = useState("");
//   const [activeInput, setActiveInput] = useState(null);

//   // Open the keypad for input
//   const handleOpenKeypad = (inputType) => {
//     setActiveInput(inputType);
//     setShowKeypad(true);
//   };

//   // Handle keypad submission
//   const handleKeypadSubmit = (value) => {
//     setInputValue(value);
//     setShowKeypad(false);
//     setShowConfirmation(true);
//   };

//   // Confirm and update parameters
//   const handleConfirm = () => {
//     if (activeInput === "cutLength") {
//       setCutLength(inputValue);
//     } else if (activeInput === "cutQuantity") {
//       setCutQuantity(inputValue);
//     }
//     setShowConfirmation(false);
//     setActiveInput(null);
//   };

//   const handleCancel = () => {
//     setShowConfirmation(false);
//     setInputValue("");
//     setActiveInput(null);
//   };

//   // Send cut parameters to the server
//   const handleStart = () => {
//     const data = {
//       cutLength: parseFloat(cutLength),
//       cutQuantity: parseInt(cutQuantity, 10)
//     };
//     socket.emit("set_cut_parameters", data);
//     console.log('Parameters sent to server:', data);
//   };

//   const handleReset = () => {
//     setShowResetConfirmation(true);
//   };

//   const confirmReset = () => {
//     socket.emit("reset_encoder");
//     console.log('Encoder reset');
//     setCutLength("000.000");
//     setCutQuantity("00000");
//     setShowResetConfirmation(false);
//   };

//   const cancelReset = () => {
//     setShowResetConfirmation(false);
//   };

//   // Socket.IO event listeners
//   useEffect(() => {
//     socket.on("connect", () => {
//         setConnectionStatus("Connected");
//         console.log("Connected to server");
//     });

//     socket.on("disconnect", () => {
//         setConnectionStatus("Disconnected");
//         console.log("Disconnected from server");
//     });

//     // Listen for cut_status events from the server
//     socket.on("cut_status", (data) => {
//         console.log("Received cut_status:", data);
//         if (data.cutCount !== undefined) {
//             setCutCount(data.cutCount);
//         }
//     });

//     // Cleanup event listeners on component unmount
//     return () => {
//         socket.off("connect");
//         socket.off("disconnect");
//         socket.off("cut_status");
//     };
// }, []);


//   // useEffect(() => {
//   //   socket.on("connect", () => {
//   //     setConnectionStatus("Connected");
//   //   });

//   //   socket.on("disconnect", () => {
//   //     setConnectionStatus("Disconnected");
//   //   });

//   //   // Listen for cut status updates
//   //   socket.on("cut_status", (data) => {
//   //     console.log('Cut status received:', data); // Debug log
//   //     if (data && data.cutCount !== undefined) {
//   //       setCutCount(data.cutCount);
//   //     }
//   //     if (data && data.cutCycleTime !== undefined) {
//   //       setCutCycleTime(data.cutCycleTime);
//   //     }
//   //     if (data && data.liveCutFeed !== undefined) {
//   //       setLiveCutFeed(data.liveCutFeed);
//   //     }
//   //   });

//   //   return () => {
//   //     socket.off("connect");
//   //     socket.off("disconnect");
//   //     socket.off("cut_status");
//   //   };
//   // }, []);

//   return (
//     <div className="app">
//       <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>
      
//       <div className="cut-data-section"> 
//         <div className="display-box-container">
//           <label className="display-label">Cut Length</label>
//           <div className="display-box">
//             <input type="text" className="display-input" value={cutLength} readOnly />
//           </div>
//           <InputButton label="Input Length" onClick={() => handleOpenKeypad("cutLength")} />
//         </div>
        
//         <div className="display-box-container">
//           <label className="display-label">Cut Quantity</label>
//           <div className="display-box">
//             <input type="text" className="display-input" value={cutQuantity} readOnly />
//           </div>
//           <InputButton label="Input Quantity" onClick={() => handleOpenKeypad("cutQuantity")} />
//         </div>
//       </div>

//       {showKeypad && (
//         <NumericKeypad 
//           onClose={() => setShowKeypad(false)} 
//           onSubmit={handleKeypadSubmit} 
//           allowDecimal={activeInput === "cutLength"}
//         />
//       )}

//       {showConfirmation && (
//         <ConfirmationDialog
//           value={inputValue}
//           onConfirm={handleConfirm}
//           onCancel={handleCancel}
//         />
//       )}

//       {showResetConfirmation && (
//         <ConfirmationDialog
//           value="Are you sure you want to reset the input values to 0?"
//           onConfirm={confirmReset}
//           onCancel={cancelReset}
//         />
//       )}
    
//       <div className="display-section">
//         <DisplayBox label="Cut Count" value={cutCount.toString().padStart(5, '0')} />
//         <DisplayBox label="Cut Cycle Time" value={String(cutCycleTime).padStart(6, '0')} />
//         <DisplayBox label="Live Cut Feed" value={String(liveCutFeed).padStart(7, '0')} />
//       </div>

//       <div className="control-section">
//         <div className="control-column">
//           <button className="control-button" onClick={handleStart}>Start</button>
//           <button className="control-button" onClick={handleReset}>Reset</button>
//           <button className="control-button blue-button">Encoder<br />Calibration</button>
//         </div>
//         <div className="control-column">
//           <button className="control-button">Material Forward</button>
//           <button className="control-button">Manual Shear</button>
//           <button className="control-button">Screen Unlocked</button>
//           <div className="image-container">
//             <IndicatorLight label="Load Material" color="yellow" />
//           </div>
//           <EStopButton label="E Stop" />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;










// import './index.css';
// import './App.css';
// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import DisplayBox from "./components/DisplayBox.jsx";
// import InputButton from "./components/InputButton.jsx";
// import ControlButton from "./components/ControlButton.jsx";
// import IndicatorLight from "./components/IndicatorLight.js";
// import EStopButton from "./components/EStopButton.jsx";
// import NumericKeypad from "./components/NumericKeypad.jsx";
// import ConfirmationDialog from './components/ConfirmationDialog.jsx';

// const socket = io('http://192.168.8.214:4100');

// function App() {
//   // State for connection status, data from ESP32, and encoder control
//   const [connectionStatus, setConnectionStatus] = useState("Disconnected");
//   const [cutLength, setCutLength] = useState("000.000");
//   const [cutQuantity, setCutQuantity] = useState("00000");
//   const [cutCount, setCutCount] = useState(0);
//   const [cutCycleTime, setCutCycleTime] = useState("000.00");
//   const [liveCutFeed, setLiveCutFeed] = useState("000.000");
//   const [showKeypad, setShowKeypad] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [showResetConfirmation, setShowResetConfirmation] = useState(false); // New state for reset confirmation
//   const [inputValue, setInputValue] = useState("");
//   const [activeInput, setActiveInput] = useState(null);

//   // Function to handle opening the keypad for input
//   const handleOpenKeypad = (inputType) => {
//     setActiveInput(inputType);
//     setShowKeypad(true);
//   };

//   // Function to handle submission of the keypad input
//   const handleKeypadSubmit = (value) => {
//     setInputValue(value);
//     setShowKeypad(false);
//     setShowConfirmation(true); // Show confirmation dialog after keypad input
//   };

//   // Confirm and update cut parameters
//   const handleConfirm = () => {
//     if (activeInput === "cutLength") {
//       setCutLength(inputValue);
//     } else if (activeInput === "cutQuantity") {
//       setCutQuantity(inputValue);
//     }
//     setShowConfirmation(false);
//     setActiveInput(null);
//   };

//   const handleCancel = () => {
//     setShowConfirmation(false);
//     setInputValue("");
//     setActiveInput(null);
//   };

//   // Function to emit the cut parameters when starting
//   const handleStart = () => {
//     const data = {
//       inputLength: parseFloat(cutLength),
//       inputQuantity: parseInt(cutQuantity, 10)
//     };
//     socket.emit("set_cut_parameters", data); // Send parameters to ESP32
//     console.log('Parameters sent:', data);
//   };

//   // Show confirmation dialog for reset only if the machine is off or paused
//   const handleReset = () => {
//     setShowResetConfirmation(true); // Show reset confirmation dialog
//   };

//   // Confirm reset action
//   const confirmReset = () => {
//     socket.emit("reset_encoder"); // Emit reset command to ESP32
//     console.log('Encoder reset');
    
//     // Reset input displays for cut length and cut quantity
//     setCutLength("000.000");
//     setCutQuantity("00000");
//     setShowResetConfirmation(false); // Hide reset confirmation dialog
//   };

//   // Cancel reset action
//   const cancelReset = () => {
//     setShowResetConfirmation(false); // Hide reset confirmation dialog
//   };

//   // Use useEffect to handle WebSocket events
//   useEffect(() => {
//     socket.on("connect", () => {
//       setConnectionStatus("Connected");
//     });

//     socket.on("disconnect", () => {
//       setConnectionStatus("Disconnected");
//     });

//     // Listen for cut_status events from the server
//     socket.on("cut_status", (data) => {
//       if (data.cutCount !== undefined) setCutCount(data.cutCount);
//       if (data.cutCycleTime !== undefined) setCutCycleTime(data.cutCycleTime);
//       if (data.liveCutFeed !== undefined) setLiveCutFeed(data.liveCutFeed);
//     });

//     // Cleanup event listeners on component unmount
//     return () => {
//       socket.off("connect");
//       socket.off("disconnect");
//       socket.off("cut_status");
//     };
//   }, []);

//   return (
//     <div className="app">
//       <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>
      
//       {/* Cut Data Section */}
//       <div className="cut-data-section"> 
//         <div className="display-box-container">
//           <label className="display-label">Cut Length</label>
//           <div className="display-box">
//             <input
//               type="text"
//               className="display-input"
//               value={cutLength}
//               readOnly
//             />
//           </div>
//           <InputButton label="Input Length" onClick={() => handleOpenKeypad("cutLength")} />
//         </div>
        
//         <div className="display-box-container">
//           <label className="display-label">Cut Quantity</label>
//           <div className="display-box">
//             <input
//               type="text"
//               className="display-input"
//               value={cutQuantity}
//               readOnly
//             />
//           </div>
//           <InputButton label="Input Quantity" onClick={() => handleOpenKeypad("cutQuantity")} />
//         </div>
//       </div>

//       {showKeypad && (
//         <NumericKeypad 
//           onClose={() => setShowKeypad(false)} 
//           onSubmit={handleKeypadSubmit} 
//           allowDecimal={activeInput === "cutLength"}
//         />
//       )}

//       {showConfirmation && (
//         <ConfirmationDialog
//           value={inputValue}
//           onConfirm={handleConfirm}
//           onCancel={handleCancel}
//         />
//       )}

//       {showResetConfirmation && (
//         <ConfirmationDialog
//           value="Are you sure you want to reset the input values to 0?"
//           onConfirm={confirmReset}
//           onCancel={cancelReset}
//         />
//       )}
    
//       {/* Display Section */}
//       <div className="display-section">
//         <DisplayBox label="Cut Count" value={cutCount.toString().padStart(5, '0')} />
//         <DisplayBox label="Cut Cycle Time" value={cutCycleTime.toString().padStart(6, '0')} />
//         <DisplayBox label="Live Cut Feed" value={liveCutFeed.toString().padStart(7, '0')} />
//       </div>

//       {/* Control Section */}
//       <div className="control-section">
//         <div className="control-column">
//           <button className="control-button" onClick={handleStart}>
//             Start
//           </button>
//           <button className="control-button" onClick={handleReset}>Reset</button>
//           <button className="control-button blue-button">Encoder<br />Calibration</button>
//         </div>
//         <div className="control-column">
//           <button className="control-button">Material Forward</button>
//           <button className="control-button">Manual Shear</button>
//           <button className="control-button">Screen Unlocked</button>
//           <div className="image-container">
//             <IndicatorLight label="Load Material" color="yellow" />
//           </div>
//           <EStopButton label="E Stop" />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;










// import './index.css';
// import './App.css';
// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import DisplayBox from "./components/DisplayBox.jsx";
// import InputButton from "./components/InputButton.jsx";
// import ControlButton from "./components/ControlButton.jsx";
// import IndicatorLight from "./components/IndicatorLight.js";
// import EStopButton from "./components/EStopButton.jsx";
// import NumericKeypad from "./components/NumericKeypad.jsx";
// import ConfirmationDialog from './components/ConfirmationDialog.jsx';

// const socket = io('http://192.168.8.214:4100');

// function App() {
//   // State for connection status, data from ESP32, and encoder control
//   const [connectionStatus, setConnectionStatus] = useState("Disconnected");
//   const [cutLength, setCutLength] = useState("000.000");
//   const [cutQuantity, setCutQuantity] = useState("00000");
//   const [cutCount, setCutCount] = useState(0);
//   const [cutCycleTime, setCutCycleTime] = useState("000.00");
//   const [liveCutFeed, setLiveCutFeed] = useState("000.000");
//   const [showKeypad, setShowKeypad] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [showResetConfirmation, setShowResetConfirmation] = useState(false); // New state for reset confirmation
//   const [inputValue, setInputValue] = useState("");
//   const [activeInput, setActiveInput] = useState(null);
//   const [isRunning, setIsRunning] = useState(false);

//   // Function to handle opening the keypad for input
//   const handleOpenKeypad = (inputType) => {
//     setActiveInput(inputType);
//     setShowKeypad(true);
//   };

//   // Function to handle submission of the keypad input
//   const handleKeypadSubmit = (value) => {
//     setInputValue(value);
//     setShowKeypad(false);
//     setShowConfirmation(true); // Show confirmation dialog after keypad input
//   };

//   // Confirm and update cut parameters
//   const handleConfirm = () => {
//     if (activeInput === "cutLength") {
//       setCutLength(inputValue);
//       socket.emit("updateCutLength", parseFloat(inputValue)); // Emit cut length to ESP32
//     } else if (activeInput === "cutQuantity") {
//       setCutQuantity(inputValue);
//       socket.emit("updateCutQuantity", parseInt(inputValue, 10)); // Emit cut quantity to ESP32
//     }
//     setShowConfirmation(false);
//     setActiveInput(null);
//   };

//   const handleCancel = () => {
//     setShowConfirmation(false);
//     setInputValue("");
//     setActiveInput(null);
//   };

//   // Function to toggle Start / Pause functionality
//   const handleStartPause = () => {
//     if (!isRunning) {
//       // If starting, send cut parameters and start encoder
//       const data = {
//         inputLength: parseFloat(cutLength),
//         inputQuantity: parseInt(cutQuantity, 10),
//       };
//       socket.emit("set_cut_parameters", data); // Send parameters to ESP32
//       socket.emit("start_encoder"); // Start the encoder
//       console.log('Encoder started with parameters:', data);
//     } else {
//       // If pausing, send pause command to ESP32
//       socket.emit("pause_encoder");
//       console.log('Encoder paused');
//     }
//     setIsRunning(!isRunning); // Toggle running state
//   };

//   // Show confirmation dialog for reset only if the machine is off or paused
//   const handleReset = () => {
//     if (!isRunning) {
//       setShowResetConfirmation(true); // Show reset confirmation dialog
//     } else {
//       alert("Machine must be paused or off to reset."); // Optional alert for the user
//     }
//   };

//   // Confirm reset action
//   const confirmReset = () => {
//     socket.emit("reset_encoder"); // Emit reset command to ESP32
//     console.log('Encoder reset');
    
//     // Reset input displays for cut length and cut quantity
//     setCutLength("000.000");
//     setCutQuantity("00000");
//     setIsRunning(false); // Reset running state
//     setShowResetConfirmation(false); // Hide reset confirmation dialog
//   };

//   // Cancel reset action
//   const cancelReset = () => {
//     setShowResetConfirmation(false); // Hide reset confirmation dialog
//   };

// //   // Use useEffect to handle WebSocket events

//  // Use useEffect to handle WebSocket events
// useEffect(() => {
//     socket.on("connect", () => {
//         setConnectionStatus("Connected");
//         console.log("Connected to server");
//     });

//     socket.on("disconnect", () => {
//         setConnectionStatus("Disconnected");
//         console.log("Disconnected from server");
//     });

//     // Listen for cut_status events from the server
//     socket.on("cut_status", (data) => {
//         console.log("Received cut_status:", data); // Debug log
//         if (data.cutCount !== undefined) {
//             console.log("Setting cutCount:", data.cutCount); // Additional log
//             setCutCount(data.cutCount); // Update React state
//         }
//     });

//     // Cleanup event listeners on component unmount
//     return () => {
//         socket.off("connect");
//         socket.off("disconnect");
//         socket.off("cut_status");
//     };
// }, []);

// //   useEffect(() => {
// //     socket.on("connect", () => {
// //         setConnectionStatus("Connected");
// //         console.log("Connected to server");
// //     });

// //     socket.on("disconnect", () => {
// //         setConnectionStatus("Disconnected");
// //         console.log("Disconnected from server");
// //     });

// //     // Listen for cut_status events from the server
// //     socket.on("cut_status", (data) => {
// //         console.log("Received cut_status:", data); // Debug log
// //         if (data.cutCount !== undefined) {
// //             console.log("Setting cutCount:", data.cutCount); // Additional log
// //             setCutCount(data.cutCount); // Update React state
// //         }
// //     });

// //     // Cleanup event listeners on component unmount
// //     return () => {
// //         socket.off("connect");
// //         socket.off("disconnect");
// //         socket.off("cut_status");
// //     };
// // }, []);


//   return (
//     <div className="app">
//       <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>
      
//       {/* Cut Data Section */}
//       <div className="cut-data-section"> 
//         <div className="display-box-container">
//           <label className="display-label">Cut Length</label>
//           <div className="display-box">
//             <input
//               type="text"
//               className="display-input"
//               value={cutLength}
//               readOnly
//             />
//           </div>
//           <InputButton label="Input Length" onClick={() => handleOpenKeypad("cutLength")} />
//         </div>
        
//         <div className="display-box-container">
//           <label className="display-label">Cut Quantity</label>
//           <div className="display-box">
//             <input
//               type="text"
//               className="display-input"
//               value={cutQuantity}
//               readOnly
//             />
//           </div>
//           <InputButton label="Input Quantity" onClick={() => handleOpenKeypad("cutQuantity")} />
//         </div>
//       </div>

//       {showKeypad && (
//         <NumericKeypad 
//           onClose={() => setShowKeypad(false)} 
//           onSubmit={handleKeypadSubmit} 
//           allowDecimal={activeInput === "cutLength"}
//         />
//       )}

//       {showConfirmation && (
//         <ConfirmationDialog
//           value={inputValue}
//           onConfirm={handleConfirm}
//           onCancel={handleCancel}
//         />
//       )}

//       {showResetConfirmation && (
//         <ConfirmationDialog
//           value="Are you sure you want to reset the input values to 0?"
//           onConfirm={confirmReset}
//           onCancel={cancelReset}
//         />
//       )}
    
//       {/* Display Section */}
//       <div className="display-section">
//         <DisplayBox label="Cut Count" value={cutCount.toString().padStart(5, '0')} />
//         <DisplayBox label="Cut Cycle Time" value={cutCycleTime.toString().padStart(6, '0')} />
//         <DisplayBox label="Live Cut Feed" value={liveCutFeed.toString().padStart(7, '0')} />
//       </div> 


//       {/* Control Section */}
//       <div className="control-section">
//         <div className="control-column">
//           <button className="control-button" onClick={handleStartPause}>
//             {isRunning ? "Pause" : "Start / Pause"}
//           </button>
//           <button className="control-button" onClick={handleReset}>Reset</button>
//           <button className="control-button blue-button">Encoder<br />Calibration</button>
//         </div>
//         <div className="control-column">
//           <button className="control-button">Material Forward</button>
//           <button className="control-button">Manual Shear</button>
//           <button className="control-button">Screen Unlocked</button>
//           <div className="image-container">
//             <IndicatorLight label="Load Material" color="yellow" />
//           </div>
//           <EStopButton label="E Stop" />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;








// import './index.css'
// // import React from 'react';
// import './App.css';
// import React, {useState, useEffect} from 'react';
// import io from 'socket.io-client';
// // import Heading from "./components/Heading.jsx";
// import DisplayBox from "./components/DisplayBox.jsx";
// import InputButton from "./components/InputButton.jsx";
// import ControlButton from "./components/ControlButton.jsx";
// import IndicatorLight from "./components/IndicatorLight.js";
// import EStopButton from "./components/EStopButton.jsx";
// import NumericKeypad from "./components/NumericKeypad.jsx";
// import ConfirmationDialog from './components/ConfirmationDialog.jsx';
// // import CutLengthInput from "./components/CutLengthInput.jsx";
// // import CutQuantityInput from "./components/CutQuantityInput.jsx";
// // import Heading from './components/Heading.jsx';
// // import './components/CutQuantity'
// // import RelayButton from './components/Relays.jsx';  // Import the RelayButton component
// // import EncoderDisplay from './components/EncoderReadout.jsx';  // Import the DisplayData component



// // Establish a WebSocket connection to the Node.js server
// const socket = io('http://192.168.8.214:4100');

// function App() {
//   // State for connection status and data from ESP32
//   const [connectionStatus, setConnectionStatus] = useState("Disconnected");

//   const [cutLength, setCutLength] = useState("000.000");
//   const [cutQuantity, setCutQuantity] = useState("00000");
//   const [showKeypad, setShowKeypad] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [inputValue, setInputValue] = useState("");
//   const [activeInput, setActiveInput] = useState(null);
//   const [isRunning, setIsRunning] = useState(false);

//   // const [serialData, setTravelDistance] = useState(""); // State to hold raw serial data
//   // const [encoderCount, setEncoderCount] = useState(0); // State to hold encoder count
//   // const [cutQuantity, setCutQuantity] = useState("");
//   // // const [travelDistance, setTravelDistance] = useState(0); // Store travel distance as a string
//   // Emit changes to the server
//   // useEffect(() => {
//   //   if (cutLength !== "000.000") {
//   //     socket.emit("updateCutLength", cutLength);
//   //   }
//   // }, [cutLength]);

//   // useEffect(() => {
//   //   if (cutQuantity !== "00000") {
//   //     socket.emit("updateCutQuantity", cutQuantity);
//   //   }
//   // }, [cutQuantity]);

//   // const handleCutLengthChange = (e) => {
//   //   setCutLength(e.target.value);
//   // };

//   // const handleCutQuantityChange = (e) => {
//   //   setCutQuantity(e.target.value);
//   // };

//   // useEffect(() => {
//   //   // Emit initial values on component mount (optional)
//   //   socket.emit("initialData", { cutLength, cutQuantity });
//   // }, []);

//   const handleOpenKeypad = (inputType) => {
//     setActiveInput(inputType);
//     setShowKeypad(true);
//   };

//   const handleKeypadSubmit = (value) => {
//     setInputValue(value);
//     setShowKeypad(false);
//     setShowConfirmation(true); // Show confirmation dialog after keypad input
//   };

//   // Confirm and update cut parameters
//   const handleConfirm = () => {
//     if (activeInput === "cutLength") {
//       setCutLength(inputValue);
//       socket.emit("updateCutLength", parseFloat(inputValue)); // Emit cut length to ESP32
//     } else if (activeInput === "cutQuantity") {
//       setCutQuantity(inputValue);
//       socket.emit("updateCutQuantity", parseInt(inputValue, 10)); // Emit cut quantity to ESP32
//     }
//     setShowConfirmation(false);
//     setActiveInput(null);
//   };

//   // const handleConfirm = () => {
//   //   if (activeInput === "cutLength") {
//   //     setCutLength(inputValue);
//   //     socket.emit("updateCutLength", inputValue);
//   //   } else if (activeInput === "cutQuantity") {
//   //     setCutQuantity(inputValue);
//   //     socket.emit("updateCutQuantity", inputValue);
//   //   }
//   //   setShowConfirmation(false);
//   //   setActiveInput(null);
//   // };

//   const handleCancel = () => {
//     setShowConfirmation(false);
//     setInputValue("");
//     setActiveInput(null);
//   };

//   // Function to toggle Start / Pause functionality
//   const handleStartPause = () => {
//     if (!isRunning) {
//       // If starting, send cut parameters and start encoder
//       const data = {
//         inputLength: parseFloat(cutLength),
//         inputQuantity: parseInt(cutQuantity, 10),
//       };
//       socket.emit("set_cut_parameters", data); // Send parameters to ESP32
//       socket.emit("start_encoder"); // Start the encoder
//       console.log('Encoder started with parameters:', data);
//     } else {
//       // If pausing, send pause command to ESP32
//       socket.emit("pause_encoder");
//       console.log('Encoder paused');
//     }
//     setIsRunning(!isRunning); // Toggle running state
//   };

//   // Reset encoder functionality
//   const handleReset = () => {
//     socket.emit("reset_encoder");
//     console.log('Encoder reset');
//     setIsRunning(false); // Reset running state
//   };



//   // Use useEffect to handle WebSocket events
// useEffect(() => {
//     socket.on("connect", () => {
//         setConnectionStatus("Connected");
//         console.log("Connected to server");
//     });

//     socket.on("disconnect", () => {
//         setConnectionStatus("Disconnected");
//         console.log("Disconnected from server");
//     });

//     // Listen for cut_status events from the server
//     socket.on("cut_status", (data) => {
//         console.log("Received cut_status:", data); // Debug log
//         if (data.cutCount !== undefined) {
//             console.log("Setting cutCount:", data.cutCount); // Additional log
//             setCutCount(data.cutCount); // Update React state
//         }
//     });

//     // Cleanup event listeners on component unmount
//     return () => {
//         socket.off("connect");
//         socket.off("disconnect");
//         socket.off("cut_status");
//     };
// }, []);


//   return (
//     <div className="app">
//       <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>

//       {/* Cut Data Section */}
//       <div className="cut-data-section"> 
//         <div className="display-box-container">
//         <label className="display-label">Cut Length</label>
//         <div className="display-box">
//           <input
//             type="text"
//             className="display-input"
//             value={cutLength} readOnly
//             // onChange={handleCutLengthChange}
//           />
//           </div>
//           <InputButton label="Input Length" onClick={() => handleOpenKeypad("cutLength")} />
//         </div>
        
//         <div className="display-box-container">
//           <label className="display-label">Cut Quantity</label>
//           <div className="display-box">
//           <input
//             type="text"
//             className="display-input"
//             value={cutQuantity} readOnly
//             // onChange={handleCutQuantityChange}
//           />
//           </div>
//           <InputButton label="Input Quantity" onClick={() => handleOpenKeypad("cutQuantity")} />
//         </div>
//       </div>

//       {showKeypad && (
//         <NumericKeypad 
//           onClose={() => setShowKeypad(false)} 
//           onSubmit={handleKeypadSubmit} 
//           allowDecimal={activeInput === "cutLength"}
//         />
//       )}

//       {showConfirmation && (
//         <ConfirmationDialog
//           value={inputValue}
//           onConfirm={handleConfirm}
//           onCancel={handleCancel}
//         />
//       )}
    
//       {/* Display Section */}
//       <div className="display-section">
//         <DisplayBox label="Cut Count" value="00000" />
//         <DisplayBox label="Cut Cycle Time" value="000.00" />
//         <DisplayBox label="Live Cut Feed" value="000.000" />
//       </div>

//       {/* Control Section */}
//       <div className="control-section">
//         <div className="control-column">
//         <button className="control-button" onClick={handleStartPause}>
//             {isRunning ? "Pause" : "Start / Pause"}
//           </button>
//           <button className="control-button" onClick={handleReset}>Reset</button>
//           <button className="control-button blue-button">Encoder<br />Calibration</button>
//         </div>
//         <div className="control-column">
//           <button className="control-button">Material Forward</button>
//           <button className="control-button">Manual Shear</button>
//           <button className="control-button">Screen Unlocked</button>
//           <div className="image-container">
//             <IndicatorLight label="Load Material" color="yellow" />
//           </div>
//           <button className="e-stop-button">E Stop</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;
