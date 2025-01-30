import "./index.css";
import "./App.css";
import React, { useState, useEffect, useRef} from "react";
import io from "socket.io-client";
import DisplayBox from "./components/DisplayBox.jsx";
import InputButton from "./components/InputButton.jsx";
import ControlButton from "./components/ControlButton.jsx";
import EncoderCalibrationPopup from "./components/EncoderCalibrationPopup";
import CalibrationAccessKeypad from "./components/CalibrationAccessKeypad.jsx";
import NumericKeypad from "./components/NumericKeypad.jsx";
import ConfirmationDialog from "./components/ConfirmationDialog.jsx";
import ScreenLockButton from "./components/ScreenLockButton.jsx";
import EStopButton from "./components/EStopButton.jsx";
import CutLength from "./components/CutLengthInput.jsx";
import CutQuantity from "./components/CutQuantityInput.jsx";

const socket = io('http://192.168.1.238:4300');

// const socket = io("http://192.168.4.1:4300");

function App() {
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  // ✅ State & useRef for Cut Length and Quantity
  const [cutLength, setCutLength] = useState("000.000");
  const cutLengthRef = useRef("000.000"); // ✅ Always holds the latest value

  const [cutQuantity, setCutQuantity] = useState("00000");
  const cutQuantityRef = useRef("00000"); // ✅ Always holds the latest value

  // const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  // const [cutLength, setCutLength] = useState("000.000");
  // const [cutQuantity, setCutQuantity] = useState("00000");
  const [cutCount, setCutCount] = useState(0);
  const [cutCycleTime, setCutCycleTime] = useState("00:00:00");
  const [liveCutFeed, setLiveCutFeed] = useState(0);
  const [showAccessKeypad, setShowAccessKeypad] = useState(false);
  const [showEncoderCalibration, setShowEncoderCalibration] = useState(false);
  const [wheelDiameter, setWheelDiameter] = useState(4.0); // Default wheel diameter
  const [shearDelay, setShearDelay] = useState(6.0);
  const [isRunning, setIsRunning] = useState(false); // Track if motor is running
  const [isPaused, setIsPaused] = useState(false); // Track if motor is paused
  const [isLocked, setIsLocked] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(false); // Reset trigger
  const [startTrigger, setStartTrigger] = useState(false);
  const [isEStopActive, setIsEStopActive] = useState(false); // Track E-STOP state
  const [isResumeRequired, setIsResumeRequired] = useState(false); // Track if Resume is required
  const [timer, setTimer] = useState(null);
  const [timerStartTime, setTimerStartTime] = useState(0); // Start time for timer
  const [elapsedTime, setElapsedTime] = useState(0); // Accumulated time for timer

  // *****************************Logic for Cut Cycle Time and Reset Handling*******************************

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const startTimer = () => {
    const startTime = Date.now();
    setTimerStartTime(startTime);
    const newTimer = setInterval(() => {
      const totalElapsedTime = (Date.now() - startTime) / 1000;
      setElapsedTime(totalElapsedTime); // Save elapsed time for pause/resume
      setCutCycleTime(formatTime(totalElapsedTime)); // Format and update display
    }, 100);
    setTimer(newTimer);
  };

  const resumeTimer = () => {
    const resumeTime = Date.now();
    const offsetTime = elapsedTime * 1000; // Convert elapsed time to milliseconds
    const newStartTime = resumeTime - offsetTime;
    setTimerStartTime(newStartTime);
    const newTimer = setInterval(() => {
      const totalElapsedTime = (Date.now() - newStartTime) / 1000;
      setElapsedTime(totalElapsedTime);
      setCutCycleTime(formatTime(totalElapsedTime)); // Format and update display
    }, 100);
    setTimer(newTimer);
  };

  const pauseTimer = () => {
    if (timer) {
      clearInterval(timer);
    }
    setTimer(null);
  };

  const resetTimer = () => {
    if (timer) {
      clearInterval(timer); // Stop the timer interval
    }
    setTimer(null);
    setElapsedTime(0);
    setCutCycleTime("00:00:00"); // Reset the displayed timer
  };
// ********************************* End of Cut Cycle Timer Logic ******************************************


// ************************* Start of Logic for Start/Pause & Sending Cut Parameters **************************

const handleStartPause = () => {
  if (isEStopActive) {
      alert("Reset the E-Stop first before continuing.");
      return;
  }

  if (isResumeRequired) {
      socket.emit("resume_motor");
      setIsResumeRequired(false);
      setIsRunning(true);
      setLiveCutFeed(0);
      return;
  }

  if (isPaused) {
      socket.emit("resume_motor");
      setIsRunning(true);
      setIsPaused(false);
      setLiveCutFeed(0);
      return;
  }

  if (isRunning) {
      socket.emit("pause_motor");
      setIsRunning(false);
      setIsPaused(true);
      return;
  }

  // ✅ Use latest values from useRef instead of outdated useState
  const currentCutLength = parseFloat(cutLengthRef.current) || 0;
  const currentCutQuantity = parseInt(cutQuantityRef.current, 10) || 0;

  console.log("Sending cut parameters:", currentCutLength, currentCutQuantity);

  socket.emit("set_cut_parameters", { 
      cutLength: currentCutLength, 
      cutQuantity: currentCutQuantity 
  }, (ack) => {
      if (ack && ack.error) {
          console.error("Error sending cut parameters:", ack.error);
      } else {
          console.log("Cut parameters sent to server:", currentCutLength, currentCutQuantity);
      }
  });

  socket.emit("start_motor");
  setIsRunning(true);
  setIsPaused(false);
  setLiveCutFeed(0);
};


//   setIsRunning(true);
//   setIsPaused(false);
//   startTimer();
//   setLiveCutFeed(0);
// };



  // const handleStartPause = () => {
  //   if (isEStopActive) {
  //     alert("Reset the E-Stop first before continuing.");
  //     return;
  //   }

  //   if (isResumeRequired) {
  //     socket.emit("resume_motor", (ack) => {
  //       if (ack && ack.error) {
  //         console.error("Error resuming motor:", ack.error);
  //       } else {
  //         console.log("Motor resumed after E-STOP reset.");
  //       }
  //     });
  //     setIsResumeRequired(false); // Resume is no longer required
  //     setIsRunning(true); // Machine is running
  //     startTimer(); // Resume the timer
  //     return;
  //   }

  //   if (isPaused) {
  //     socket.emit("resume_motor", (ack) => {
  //       if (ack && ack.error) {
  //         console.error("Error resuming motor:", ack.error);
  //       } else {
  //         console.log("Motor resumed.");
  //       }
  //     });
  //     setIsRunning(true); // Machine is running
  //     setIsPaused(false); // Clear paused state
  //     resumeTimer(); // Resume the timer
  //     return;
  //   }

  //   if (isRunning) {
  //     socket.emit("pause_motor", (ack) => {
  //       if (ack && ack.error) {
  //         console.error("Error pausing motor:", ack.error);
  //       } else {
  //         console.log("Motor paused.");
  //       }
  //     });
  //     setIsRunning(false); // Machine is paused
  //     setIsPaused(true); // Set paused state
  //     pauseTimer(); // Pause the timer
  //     return;
  //   }

  //   // Default case: Start the motor
  //   const data = {
  //     cutLength: parseFloat(cutLength),
  //     cutQuantity: parseInt(cutQuantity, 10),
  //   };

  //   socket.emit("set_cut_parameters", data, (ack) => {
  //     if (ack && ack.error) {
  //       console.error("Error sending cut parameters:", ack.error);
  //     } else {
  //       console.log("Cut parameters sent to server:", data);
  //     }
  //   });

  //   socket.emit("start_motor", (ack) => {
  //     if (ack && ack.error) {
  //       console.error("Error starting motor:", ack.error);
  //     } else {
  //       console.log("Motor started.");
  //     }
  //   });

  //   setIsRunning(true); // Machine is running
  //   setIsPaused(false); // Clear paused state
  //   startTimer(); // Start the timer
  //   // setLiveCutFeed(0); // Reset live cut feed when motor starts
  // };
// **************************** End of Start/Pause and cut parameter logic ********************************



//********************** */ Reset for timer, cut count, and cut feed *****************************************8
const handleReset = () => {
  console.log("Reset command sent.");

  setResetTrigger((prev) => !prev);  // ✅ Toggle Reset Trigger
  setCutLength("000.000");
  cutLengthRef.current = "000.000";  // ✅ Reset Ref

  setCutQuantity("00000");
  cutQuantityRef.current = "00000";  // ✅ Reset Ref

  setCutCount(0);
  setLiveCutFeed(0);  // ✅ Ensure Live Cut Feed is Reset
  setIsRunning(false);
  setIsPaused(false);
  setIsResumeRequired(false);

  console.log("Live Cut Feed Reset to 0");
};



// const handleReset = () => {
  //   console.log("Reset command sent.");

  //   // Toggle resetTrigger to notify CutLength.js & CutQuantity.js
  //   setResetTrigger((prev) => !prev);

  //   // Reset other relevant states in App.js
  //   resetTimer(); // Reset the timer
  //   setCutLength("0.000");
  //   setCutQuantity("00000");
  //   setCutCount(0);
  //   setLiveCutFeed(0);
  //   setIsRunning(false);
  //   setIsPaused(false);
  //   setIsResumeRequired(false);

  //   alert("Machine reset successfully!");
  // };
// ***********************************************************************************************************


// ********************** Logic for Material forward and Manual Shear Momentary Buttons ***********************

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
  // **********************************************************************************************************

  // handler for screen lock button
  const handleToggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  // Handler for E-stop 
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

  // handles the access control keypad for the calibration settings 
  const handleOpenCalibration = () => {
    setShowAccessKeypad(true); // Show PIN keypad first
  };

  // handler for opening the calibration settings after successful pin input 
  const handleAccessGranted = () => {
    setShowAccessKeypad(false);
    setShowEncoderCalibration(true); // Open Calibration after correct PIN
  };

  const handleCutLengthChange = (value) => {
    setCutLength(value);
    cutLengthRef.current = value;  // ✅ Ensure latest value is always available
    console.log("Updated Cut Length:", value);
  };

  const handleCutQuantityChange = (value) => {
    setCutQuantity(value);
    cutQuantityRef.current = value;  // ✅ Ensure latest value is always available
    console.log("Updated Cut Quantity:", value);
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

      if (data.inputQuantity !== undefined) {
        const newQuantity = parseInt(data.inputQuantity, 10);

        // Stop the timer and reset states when quantity reaches zero
        if (newQuantity <= 0) {
          resetTimer(); // Stop the timer
          setIsRunning(false);
          setIsPaused(false);
          setCutQuantity("00000");
          alert("Cutting process completed!"); // Notify the user
        } else {
          setCutQuantity(newQuantity.toString().padStart(5, "0"));
        }
      }

      if (data.cutCount !== undefined) {
        setCutCount(data.cutCount);
      }
    });

    // ✅ Listen for Live Cut Feed updates (Re-enabled this)
    socket.on("travel_distance", (data) => {
      if (data.travelDistance !== undefined) {
        setLiveCutFeed(Number(data.travelDistance));
      }
    });

    // ✅ Reset Live Cut Feed when Reset Trigger is activated
    if (resetTrigger) {
      console.log("Reset Trigger Detected: Resetting Live Cut Feed...");
      setLiveCutFeed(0);
    }

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

    socket.on("cutting_completed", (data) => {
      console.log("Cutting process completed:", data);

      // Reset states
      setIsRunning(false);
      setIsPaused(false);
      setIsResumeRequired(false);

      // Stop and reset the timer
      resetTimer();

      // Optionally reset cut-related values
      setCutCount(data.cutCount || 0);
      setCutQuantity("00000");
    });

    // ✅ Cleanup listeners when component unmounts
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("cut_status");
      socket.off("travel_distance");
      socket.off("e_stop_triggered");
      socket.off("reset_e_stop");
      socket.off("pause_motor");
      socket.off("resume_motor");
      socket.off("cutting_completed");
    };
}, [cutLength, resetTrigger]);  // ✅ Added resetTrigger to dependency list

  
  // useEffect(() => {
  //   socket.on("connect", () => {
  //     setConnectionStatus("Connected");
  //     console.log("Connected to server");
  //   });

  //   socket.on("disconnect", () => {
  //     setConnectionStatus("Disconnected");
  //     console.log("Disconnected from server");
  //   });

  //   socket.on("cut_status", (data) => {
  //     console.log("Received cut_status:", data);

  //     if (data.inputQuantity !== undefined) {
  //       const newQuantity = parseInt(data.inputQuantity, 10);

  //       // Stop the timer and reset states when quantity reaches zero
  //       if (newQuantity <= 0) {
  //         resetTimer(); // Stop the timer
  //         setIsRunning(false);
  //         setIsPaused(false);
  //         setCutQuantity("00000");
  //         alert("Cutting process completed!"); // Notify the user
  //       } else {
  //         setCutQuantity(newQuantity.toString().padStart(5, "0"));
  //       }
  //     }

  //     if (data.cutCount !== undefined) {
  //       setCutCount(data.cutCount);
  //     }
  //   });

    

  //   // socket.on("travel_distance", (data) => {
  //   //   if (data.travelDistance !== undefined) {
  //   //     setLiveCutFeed(Number(data.travelDistance));
  //   //   }
  //   // });

  //   socket.on("e_stop_triggered", () => {
  //     setIsEStopActive(true);
  //     setIsResumeRequired(true);
  //     setIsRunning(false);
  //     setIsPaused(false);
  //   });

  //   socket.on("reset_e_stop", () => {
  //     setIsEStopActive(false);
  //   });

  //   socket.on("pause_motor", () => {
  //     setIsRunning(false);
  //     setIsPaused(true);
  //   });

  //   socket.on("resume_motor", () => {
  //     setIsRunning(true);
  //     setIsPaused(false);
  //     setIsResumeRequired(false);
  //   });

  //   socket.on("cutting_completed", (data) => {
  //     console.log("Cutting process completed:", data);

  //     // Reset states
  //     setIsRunning(false);
  //     setIsPaused(false);
  //     setIsResumeRequired(false);

  //     // Stop and reset the timer
  //     resetTimer();

  //     // Optionally reset cut-related values
  //     setCutCount(data.cutCount || 0);
  //     setCutQuantity("00000");
  //   });

  //   return () => {
  //     socket.off("connect");
  //     socket.off("disconnect");
  //     socket.off("cut_status");
  //     socket.off("travel_distance");
  //     socket.off("e_stop_triggered");
  //     socket.off("reset_e_stop");
  //     socket.off("resume");
  //     socket.off("cutting_completed");
  //   };
  // }, [cutLength]);

  return (
    <div className="app">
      <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>

      {/* / Wrap components inside cut-data-section for correct layout */ }
      <div className="cut-data-section">
      <CutLength
    isLocked={isLocked} 
    onCutLengthChange={handleCutLengthChange}  // ✅ Pass function
/>

        
        {/* <CutLength
          isLocked={isLocked}
          socket={socket}
          resetTrigger={resetTrigger}
        /> */}
        <CutQuantity 
    isLocked={isLocked} 
    onCutQuantityChange={handleCutQuantityChange}  // ✅ Pass function
/>

        {/* <CutQuantity
          isLocked={isLocked}
          socket={socket}
          resetTrigger={resetTrigger}
        /> */}
      </div>

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
            disabled={isLocked || isRunning} // Disable Reset when running
          >
            Reset
          </button>
          <button
            className="control-button blue-button"
            onClick={!isLocked ? handleOpenCalibration : null}
            disabled={isLocked}
          >
            Calibration
          </button>

          {/* Access PIN Keypad */}
          {showAccessKeypad && (
            <CalibrationAccessKeypad
              onClose={() => setShowAccessKeypad(false)}
              onAccessGranted={handleAccessGranted}
            />
          )}

          {showEncoderCalibration && (
            <EncoderCalibrationPopup
              onClose={() => setShowEncoderCalibration(false)}
              onSubmit={(calibration) => {
                // Persist the new calibration values
                setWheelDiameter(calibration.wheelDiameter);
                setShearDelay(calibration.shearDelay);

                // Emit the entire calibration object to the server
                socket.emit("update_calibration", {
                  calibration, // Send the calibration object
                });

                console.log(
                  `Calibration updated: ${JSON.stringify(calibration)}`
                );
              }}
              defaultCalibration={{
                wheelDiameter,
                shearDelay, // Pass the current shear delay value
              }}
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
