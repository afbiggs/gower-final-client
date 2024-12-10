import './index.css';
import './App.css';
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import DisplayBox from "./components/DisplayBox.jsx";
import InputButton from "./components/InputButton.jsx";
import ControlButton from "./components/ControlButton.jsx";
import EncoderCalibrationPopup from "./components/EncoderCalibrationPopup";
import NumericKeypad from "./components/NumericKeypad.jsx";
import ConfirmationDialog from './components/ConfirmationDialog.jsx';
import ScreenLockButton from './components/ScreenLockButton.jsx';
import EStopButton from './components/EStopButton.jsx';

const socket = io('http://192.168.1.228:4300');



function App() {
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [cutLength, setCutLength] = useState("000.000");
  const [cutQuantity, setCutQuantity] = useState("00000");
  const [cutCount, setCutCount] = useState(0);
  const [cutCycleTime, setCutCycleTime] = useState("00:00:00");
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

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
      clearInterval(timer);
    }
    setTimer(null);
    setElapsedTime(0);
    setCutCycleTime("00:00:00"); // Reset the display to hours:minutes:seconds
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
  
  

  const handleReset = () => {
    setShowResetConfirmation(true);
  };

  const confirmReset = () => {
    // Emit the reset command to the server/ESP32
    socket.emit("confirm_reset", { action: "reset" });
  
    console.log("Reset command sent to ESP32");
  
    // Reset all relevant states
    setCutLength("000.000"); // Reset cut length display
    setCutQuantity("00000"); // Reset cut quantity display
    setCutCount(0); // Reset cut count
    setLiveCutFeed(0); // Reset live cut feed
    setCutCycleTime("00:00:00"); // Reset the cut cycle timer
    setIsRunning(false); // Ensure the process is not marked as running
    setIsPaused(false); // Clear the paused state
    setIsResumeRequired(false); // Clear the resume requirement state
  
    setShowResetConfirmation(false); // Close the reset confirmation dialog
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
    <span className="display-length">
      {cutLength}
      <span className="unit"> in</span>
    </span>
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


