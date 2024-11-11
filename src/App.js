import './index.css';
import './App.css';
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import DisplayBox from "./components/DisplayBox.jsx";
import InputButton from "./components/InputButton.jsx";
import ControlButton from "./components/ControlButton.jsx";
import IndicatorLight from "./components/IndicatorLight.js";
import EStopButton from "./components/EStopButton.jsx";
import NumericKeypad from "./components/NumericKeypad.jsx";
import ConfirmationDialog from './components/ConfirmationDialog.jsx';

const socket = io('http://192.168.8.215:4100');

function App() {
  // State for connection status, data from ESP32, and encoder control
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [cutLength, setCutLength] = useState("000.000");
  const [cutQuantity, setCutQuantity] = useState("00000");
  const [showKeypad, setShowKeypad] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false); // New state for reset confirmation
  const [inputValue, setInputValue] = useState("");
  const [activeInput, setActiveInput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Function to handle opening the keypad for input
  const handleOpenKeypad = (inputType) => {
    setActiveInput(inputType);
    setShowKeypad(true);
  };

  // Function to handle submission of the keypad input
  const handleKeypadSubmit = (value) => {
    setInputValue(value);
    setShowKeypad(false);
    setShowConfirmation(true); // Show confirmation dialog after keypad input
  };

  // Confirm and update cut parameters
  const handleConfirm = () => {
    if (activeInput === "cutLength") {
      setCutLength(inputValue);
      socket.emit("updateCutLength", parseFloat(inputValue)); // Emit cut length to ESP32
    } else if (activeInput === "cutQuantity") {
      setCutQuantity(inputValue);
      socket.emit("updateCutQuantity", parseInt(inputValue, 10)); // Emit cut quantity to ESP32
    }
    setShowConfirmation(false);
    setActiveInput(null);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setInputValue("");
    setActiveInput(null);
  };

  // Function to toggle Start / Pause functionality
  const handleStartPause = () => {
    if (!isRunning) {
      // If starting, send cut parameters and start encoder
      const data = {
        inputLength: parseFloat(cutLength),
        inputQuantity: parseInt(cutQuantity, 10),
      };
      socket.emit("set_cut_parameters", data); // Send parameters to ESP32
      socket.emit("start_encoder"); // Start the encoder
      console.log('Encoder started with parameters:', data);
    } else {
      // If pausing, send pause command to ESP32
      socket.emit("pause_encoder");
      console.log('Encoder paused');
    }
    setIsRunning(!isRunning); // Toggle running state
  };

  // Show confirmation dialog for reset only if the machine is off or paused
  const handleReset = () => {
    if (!isRunning) {
      setShowResetConfirmation(true); // Show reset confirmation dialog
    } else {
      alert("Machine must be paused or off to reset."); // Optional alert for the user
    }
  };

  // Confirm reset action
  const confirmReset = () => {
    socket.emit("reset_encoder"); // Emit reset command to ESP32
    console.log('Encoder reset');
    
    // Reset input displays for cut length and cut quantity
    setCutLength("000.000");
    setCutQuantity("00000");
    setIsRunning(false); // Reset running state
    setShowResetConfirmation(false); // Hide reset confirmation dialog
  };

  // Cancel reset action
  const cancelReset = () => {
    setShowResetConfirmation(false); // Hide reset confirmation dialog
  };

  // Use useEffect to handle WebSocket events
  useEffect(() => {
    socket.on("connect", () => {
      setConnectionStatus("Connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("Disconnected");
    });

    // Cleanup event listeners on component unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("travel_distance");
      socket.off("encoder_count");
    };
  }, []);

  return (
    <div className="app">
      <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>
      
      {/* Cut Data Section */}
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
          <InputButton label="Input Length" onClick={() => handleOpenKeypad("cutLength")} />
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
    
      {/* Display Section */}
      <div className="display-section">
        <DisplayBox label="Cut Count" value="00000" />
        <DisplayBox label="Cut Cycle Time" value="000.00" />
        <DisplayBox label="Live Cut Feed" value="000.000" />
      </div>

      {/* Control Section */}
      <div className="control-section">
        <div className="control-column">
          <button className="control-button" onClick={handleStartPause}>
            {isRunning ? "Pause" : "Start / Pause"}
          </button>
          <button className="control-button" onClick={handleReset}>Reset</button>
          <button className="control-button blue-button">Encoder<br />Calibration</button>
        </div>
        <div className="control-column">
          <button className="control-button">Material Forward</button>
          <button className="control-button">Manual Shear</button>
          <button className="control-button">Screen Unlocked</button>
          <div className="image-container">
            <IndicatorLight label="Load Material" color="yellow" />
          </div>
          <EStopButton label="E Stop" />
        </div>
      </div>
    </div>
  );
}

export default App;








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
// const socket = io('http://192.168.8.215:4100');

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
//   useEffect(() => {
//     // // On WebSocket connection
//     socket.on("connect", () => {
//       setConnectionStatus("Connected");
//     });

//     // // On WebSocket disconnection
//     socket.on("disconnect", () => {
//       setConnectionStatus("Disconnected");
//     });

//     // socket.on("travel_distance", (distance) => {
//     //   console.log("Received travel distance:", distance);
//     //   setTravelDistance(distance); // Handle the travel distance data
//     // });

//     // Listen for encoder count data from the ESP32
//     // socket.on("encoder_count", (count) => {
//     //   setEncoderCount(count); // Update state with encoder count
//     // });

//     // Cleanup event listeners on component unmount
//     return () => {
//       socket.off("connect");
//       socket.off("disconnect");
//       socket.off("travel_distance");
//       socket.off("encoder_count");
//     };
//   }, []);

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
