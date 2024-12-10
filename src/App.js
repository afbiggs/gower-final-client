import './index.css';
import './App.css';
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import DisplayBox from "./components/DisplayBox.jsx";
import InputButton from "./components/InputButton.jsx";
import ControlButton from "./components/ControlButton.jsx";
// import IndicatorLight from "./components/IndicatorLight.js";
import EncoderCalibrationPopup from "./components/EncoderCalibrationPopup";

import NumericKeypad from "./components/NumericKeypad.jsx";
// import EncoderCalibrationKeypad from './components/EncoderCalibrationKeypad.jsx';
import ConfirmationDialog from './components/ConfirmationDialog.jsx';
import ScreenLockButton from './components/ScreenLockButton.jsx';
import EStopButton from './components/EStopButton.jsx';

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
  const [showEncoderCalibration, setShowEncoderCalibration] = useState(false);
  const [wheelDiameter, setWheelDiameter] = useState(1.275); // Default wheel diameter
  const [inputValue, setInputValue] = useState("");
  const [activeInput, setActiveInput] = useState(null);
  const [isRunning, setIsRunning] = useState(false); // Track if motor is running
  const [isPaused, setIsPaused] = useState(false); // Track if motor is paused
  const [isLocked, setIsLocked] = useState(false);
  const [isEStopActive, setIsEStopActive] = useState(false); // Track E-STOP state
  const [isResumeRequired, setIsResumeRequired] = useState(false); // Track if Resume is required
  const [timer, setTimer] = useState(null);
  const [timerStartTime, setTimerStartTime] = useState(0); // Start time for timer
  const [elapsedTime, setElapsedTime] = useState(0); // Accumulated time for timer


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

  const startTimer = () => {
    const startTime = Date.now(); // Record the current time
    setTimerStartTime(startTime); // Save the timer start time
    const newTimer = setInterval(() => {
      const totalElapsedTime = (Date.now() - startTime) / 1000; // Calculate elapsed time
      setElapsedTime(totalElapsedTime); // Save elapsed time for pause/resume
      setCutCycleTime((totalElapsedTime).toFixed(2).padStart(6, "0")); // Update display
    }, 100);
    setTimer(newTimer); // Save the interval ID
  };
  
  const resumeTimer = () => {
    const resumeTime = Date.now(); // Record the current time
    const offsetTime = elapsedTime * 1000; // Convert elapsed time to milliseconds
    const newStartTime = resumeTime - offsetTime; // Calculate the adjusted start time
    setTimerStartTime(newStartTime); // Save the new start time
    const newTimer = setInterval(() => {
      const totalElapsedTime = (Date.now() - newStartTime) / 1000; // Calculate elapsed time
      setElapsedTime(totalElapsedTime); // Save elapsed time for pause/resume
      setCutCycleTime((totalElapsedTime).toFixed(2).padStart(6, "0")); // Update display
    }, 100);
    setTimer(newTimer); // Save the interval ID
  };
  
  const pauseTimer = () => {
    if (timer) {
      clearInterval(timer); // Stop the timer
    }
    setTimer(null); // Reset the timer interval ID
  };
  
  const resetTimer = () => {
    if (timer) {
      clearInterval(timer); // Stop the timer
    }
    setTimer(null); // Reset the timer interval ID
    setElapsedTime(0); // Reset elapsed time
    setCutCycleTime("000.00"); // Reset the display
  };
  
  
  const handleStartPause = () => {
    if (isEStopActive) {
      alert("Reset the E-Stop first before resuming.");
      return;
    }
  
    if (isResumeRequired) {
      socket.emit("resume_motor", (ack) => {
        if (ack && ack.error) {
          console.error("Error resuming motor:", ack.error);
        } else {
          console.log("Motor resumed after E-Stop reset.");
        }
      });
      setIsResumeRequired(false);
      setIsRunning(true);
      setIsPaused(false);
      resumeTimer(); // Resume the timer from where it was paused
      return;
    }
  
    if (isPaused) {
      socket.emit("resume_motor", (ack) => {
        if (ack && ack.error) {
          console.error("Error resuming motor:", ack.error);
        } else {
          console.log("Motor resumed.");
        }
      });
      setIsRunning(true);
      setIsPaused(false);
      resumeTimer(); // Resume the timer from where it was paused
      return;
    }
  
    if (isRunning) {
      socket.emit("pause_motor", (ack) => {
        if (ack && ack.error) {
          console.error("Error pausing motor:", ack.error);
        } else {
          console.log("Motor paused.");
        }
      });
      setIsRunning(false);
      setIsPaused(true);
      pauseTimer(); // Pause the timer
      return;
    }
  
    if (!isRunning && !isPaused) {
      const data = {
        cutLength: parseFloat(cutLength),
        cutQuantity: parseInt(cutQuantity, 10),
      };
  
      socket.emit("set_cut_parameters", data, (ack) => {
        if (ack && ack.error) {
          console.error("Error sending cut parameters:", ack.error);
        } else {
          console.log("Cut parameters sent to server:", data);
        }
      });
  
      socket.emit("start_motor", (ack) => {
        if (ack && ack.error) {
          console.error("Error starting motor:", ack.error);
        } else {
          console.log("Motor started.");
        }
      });
  
      setIsRunning(true);
      setIsPaused(false);
      startTimer(); // Start the timer
    }
  };
  



  // const handleStartPause = () => {
  //   if (isEStopActive) {
  //     alert("Reset the E-Stop first before resuming.");
  //     return;
  //   }
  
  //   if (isResumeRequired) {
  //     // Resuming after E-Stop reset
  //     socket.emit("resume_motor", (ack) => {
  //       if (ack && ack.error) {
  //         console.error("Error resuming motor:", ack.error);
  //       } else {
  //         console.log("Motor resumed after E-Stop reset.");
  //       }
  //     });
  //     setIsResumeRequired(false); // Clear resume requirement
  //     setIsRunning(true);         // Mark as running
  //     setIsPaused(false);
  //     resumeTimer();         // Ensure paused state is cleared
  //     return;
  //   }
  
  //   if (isPaused) {
  //     // Resuming the motor after pause
  //     socket.emit("resume_motor", (ack) => {
  //       if (ack && ack.error) {
  //         console.error("Error resuming motor:", ack.error);
  //       } else {
  //         console.log("Motor resumed.");
  //       }
  //     });
  //     setIsRunning(true);
  //     setIsPaused(false);
  //     resumeTimer();
  //     return;
  //   }
  
  //   if (isRunning) {
  //     // Pausing the motor
  //     socket.emit("pause_motor", (ack) => {
  //       if (ack && ack.error) {
  //         console.error("Error pausing motor:", ack.error);
  //       } else {
  //         console.log("Motor paused.");
  //       }
  //     });
  //     setIsRunning(false);
  //     setIsPaused(true);
  //     pauseTimer();
  //     return;
  //   }
  
  //   if (!isRunning && !isPaused) {
  //     // Starting the motor for the first time
  //     const data = {
  //       cutLength: parseFloat(cutLength),
  //       cutQuantity: parseInt(cutQuantity, 10),
  //     };
  
  //     socket.emit("set_cut_parameters", data, (ack) => {
  //       if (ack && ack.error) {
  //         console.error("Error sending cut parameters:", ack.error);
  //       } else {
  //         console.log("Cut parameters sent to server:", data);
  //       }
  //     });
  
  //     socket.emit("start_motor", (ack) => {
  //       if (ack && ack.error) {
  //         console.error("Error starting motor:", ack.error);
  //       } else {
  //         console.log("Motor started.");
  //       }
  //     });
  
  //     setIsRunning(true);
  //     setIsPaused(false);
  //     startTimer(); // Start the timer
  //   }
  // };
  
  

  const handleReset = () => {
    setShowResetConfirmation(true);
  };

  const confirmReset = () => {
    socket.emit("confirm_reset", { action: "reset" });

    console.log("Reset command sent to ESP32");

    setCutLength("000.000");
    setCutQuantity("00000");
    setCutCount("0000");
    setLiveCutFeed(0);
    resetTimer(); // Reset the timer
    setIsRunning(false); // Reset running state
    setShowResetConfirmation(false);
  };

  const cancelReset = () => {
    setShowResetConfirmation(false);
  };

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

  const handleToggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  const handleToggleEStop = () => {
    if (!isEStopActive) {
      console.log("E-STOP Triggered");
      socket.emit("e_stop");
      setIsEStopActive(true);
      setIsResumeRequired(true);
      pauseTimer(); // Pause timer on E-STOP
    } else {
      console.log("E-STOP Reset Triggered");
      socket.emit("reset_e_stop");
      setIsEStopActive(false);
    }
  };

  

  const handleOpenCalibration = () => {
    setShowEncoderCalibration(true);
  };

  const handleCalibrationSubmit = (newDiameter) => {
    if (newDiameter > 0) {
      socket.emit('update_wheel_diameter', { wheelDiameter: newDiameter });
      console.log(`Wheel circumference sent to server: ${newDiameter}`);
      setShowEncoderCalibration(false); // Close the popup
    } else {
      alert('Please enter a valid diameter.');
    }
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
          if (newQuantity <= 0) {
            resetTimer(); // Stop timer when quantity is reached
            return "00000";
          }
          return newQuantity > 0 ? newQuantity.toString().padStart(5, '0') : "00000";
        });
      }
    });

    socket.on("travel_distance", (data) => {
      if (data.travelDistance !== undefined) {
        setLiveCutFeed(Number(data.travelDistance));
      }
    });

    socket.on("e_stop_triggered", () => {
        setIsEStopActive(true);
        setIsResumeRequired(true);
        setIsRunning(false);
        setIsPaused(false);
      });
    
    socket.on("reset_e_stop", () => {
        setIsEStopActive(false);
      });
    
    socket.on("pause_motor", () => {
        setIsRunning(false);
        setIsPaused(true);
      });
    
    socket.on("resume_motor", () => {
        setIsRunning(true);
        setIsPaused(false);
        setIsResumeRequired(false);
      });

    

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("cut_status");
      socket.off("travel_distance");
      socket.off("e_stop_triggered");
      socket.off("reset_e_stop");
      socket.off("resume");
    };
  }, [cutLength]);


return (
  <div className="app">
    <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>

    <div className="cut-data-section">
      <div className="display-box-container">
        <label className="display-label">Cut Length</label>
        <div className="display-box">
          <input
            type="text"
            className="display-input"
            value={cutLength}
            readOnly
          />
        </div>
        <InputButton
          label="Input Length"
          onClick={() => !isLocked && handleOpenKeypad("cutLength")}
          disabled={isLocked}
        />
      </div>

      <div className="display-box-container">
        <label className="display-label">Cut Quantity</label>
        <div className="display-box">
          <input
            type="text"
            className="display-input"
            value={cutQuantity}
            readOnly
          />
        </div>
        <InputButton
          label="Input Quantity"
          onClick={() => !isLocked && handleOpenKeypad("cutQuantity")}
          disabled={isLocked}
        />
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
      <DisplayBox
        label="Cut Count"
        value={cutCount.toString().padStart(5, "0")}
      />
      <DisplayBox
        label="Cut Cycle Time"
        value={String(cutCycleTime).padStart(6, "0")}
      />
      <DisplayBox
        label="Live Cut Feed"
        value={liveCutFeed.toFixed(3).toString().padStart(7, "0")}
      />
    </div>

    <div className="control-section">
      <div className="control-column">
        <button
          className="control-button"
          onClick={!isLocked ? handleStartPause : null}
          disabled={isLocked}
        >
          {isEStopActive
            ? "Reset E-Stop Required"
            : isResumeRequired
            ? "Resume"
            : isPaused
            ? "Resume"
            : isRunning
            ? "Pause"
            : "Start"}
        </button>

        <button
          className="control-button"
          onClick={!isLocked ? handleReset : null}
          disabled={isLocked}
        >
          Reset
        </button>
        <button
          className="control-button blue-button"
          onClick={!isLocked ? handleOpenCalibration : null}
          disabled={isLocked}
        >
          Encoder Calibration
        </button>

        {showEncoderCalibration && (
          <EncoderCalibrationPopup
            onClose={() => setShowEncoderCalibration(false)}
            onSubmit={(newDiameter) => {
              setWheelDiameter(newDiameter); // Persist the new diameter
              socket.emit("update_wheel_diameter", {
                wheelDiameter: newDiameter,
              });
              console.log(`Wheel diameter updated: ${newDiameter}`);
            }}
            defaultDiameter={wheelDiameter} // Pass the current value
          />
        )}
      </div>
      <div className="control-column">
        <button
          className="control-button"
          onMouseDown={!isLocked ? handleMaterialForwardPress : null}
          onMouseUp={!isLocked ? handleMaterialForwardRelease : null}
          onTouchStart={!isLocked ? handleMaterialForwardPress : null}
          onTouchEnd={!isLocked ? handleMaterialForwardRelease : null}
          disabled={isLocked}
        >
          Material Forward
        </button>
        <button
          className="control-button"
          onMouseDown={!isLocked ? handleManualShearPress : null}
          onMouseUp={!isLocked ? handleManualShearRelease : null}
          disabled={isLocked}
        >
          Manual Shear
        </button>
        <ScreenLockButton
          isLocked={isLocked}
          onToggleLock={handleToggleLock}
        />
        <div className="image-container">
          <EStopButton
            isEStopActive={isEStopActive}
            onToggleEStop={handleToggleEStop}
          />
        </div>
      </div>
    </div>
  </div>
);
}
export default App;


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
//   const [isRunning, setIsRunning] = useState(false); // Track if motor is running
//   const [isPaused, setIsPaused] = useState(false); // Track if motor is paused
//   const [isEStopActive, setIsEStopActive] = useState(false); // Track E-STOP state


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
//     if (!isRunning && !isPaused) {
//       // Starting the motor for the first time
//       const data = {
//         cutLength: parseFloat(cutLength),
//         cutQuantity: parseInt(cutQuantity, 10),
//       };
  
//       // Send cut parameters to the server
//       socket.emit("set_cut_parameters", data, (ack) => {
//         if (ack && ack.error) {
//           console.error("Error sending cut parameters:", ack.error);
//         } else {
//           console.log("Cut parameters sent to server:", data);
//         }
//       });
  
//       // Start the motor
//       socket.emit("start_motor", (ack) => {
//         if (ack && ack.error) {
//           console.error("Error starting motor:", ack.error);
//         } else {
//           console.log("Motor started.");
//         }
//       });
  
//       setIsRunning(true);
//       setIsPaused(false);
//     } else if (isRunning && !isPaused) {
//       // Pausing the motor
//       socket.emit("pause_motor", (ack) => {
//         if (ack && ack.error) {
//           console.error("Error pausing motor:", ack.error);
//         } else {
//           console.log("Motor paused.");
//         }
//       });
  
//       setIsRunning(false);
//       setIsPaused(true);
//     } else if (!isRunning && isPaused) {
//       // Resuming the motor
//       socket.emit("resume_motor", (ack) => {
//         if (ack && ack.error) {
//           console.error("Error resuming motor:", ack.error);
//         } else {
//           console.log("Motor resumed.");
//         }
//       });
  
//       setIsRunning(true);
//       setIsPaused(false);
//     }
//   };
  
  
//   const handleReset = () => {
//     setShowResetConfirmation(true);
//   };

//   const confirmReset = () => {
//     // Send reset command to the server to ensure relays turn off after completing the current cut
//     socket.emit("confirm_reset", { action: "reset" });
  
//     console.log("Reset command sent to ESP32");
  
//     // Update UI state
//     setCutLength("000.000");
//     setCutQuantity("00000");
//     setCutCount("0000");
//     setLiveCutFeed(0);
//     setIsRunning(false); // Reset running state
//     setShowResetConfirmation(false);
//   };
  
//   const cancelReset = () => {
//     setShowResetConfirmation(false);
//   };

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

//   const handleEStop = () => {
//     console.log("E-Stop Triggered");
//     socket.emit("e_stop"); // Send the E-Stop command to the server
//   };

//   const handleToggleEStop = () => {
//     if (!isEStopActive) {
//       console.log("E-STOP Triggered");
//       socket.emit("e_stop"); // Send the E-Stop command to the server
//     } else {
//       console.log("E-STOP Reset Triggered");
//       socket.emit("reset_e_stop"); // Send the Reset E-Stop command to the server
//     }
//     setIsEStopActive(!isEStopActive); // Toggle the state
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

//     socket.on('travel_distance', (data) => {
//       if (data.travelDistance !== undefined) {
//         setLiveCutFeed(Number(data.travelDistance));
//       }
//     });

//     return () => {
//       socket.off("connect");
//       socket.off("disconnect");
//       socket.off("cut_status");
//       socket.off("travel_distance");
//     };
//   }, [cutLength]);

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
//           <button className="control-button" onClick={handleStartPause}>
//             {!isRunning && !isPaused ? "Start" : isRunning ? "Pause" : "Resume"}
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
//           <EStopButton isEStopActive={isEStopActive} onToggleEStop={handleToggleEStop} />

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
