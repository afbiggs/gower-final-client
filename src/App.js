

import './index.css'
// import React from 'react';
import './App.css';
// import './global.css';
import React, {useState, useEffect} from 'react';
import io from 'socket.io-client';
// import Heading from "./components/Heading.jsx";
import DisplayBox from "./components/DisplayBox.jsx";
import InputButton from "./components/InputButton.jsx";
import ControlButton from "./components/ControlButton.jsx";
import IndicatorLight from "./components/IndicatorLight.js";
import EStopButton from "./components/EStopButton.jsx";
import NumericKeypad from "./components/NumericKeypad.jsx";
// import CutLengthInput from "./components/CutLengthInput.jsx";
// import CutQuantityInput from "./components/CutQuantityInput.jsx";
// import Heading from './components/Heading.jsx';
// import './components/CutQuantity'
// import RelayButton from './components/Relays.jsx';  // Import the RelayButton component
// import EncoderDisplay from './components/EncoderReadout.jsx';  // Import the DisplayData component

// import InputField from "./components/InputField";
// import EncoderCalibration from "./components/EncoderCalibration";



// Establish a WebSocket connection to the Node.js server
const socket = io('http://192.168.8.212:4100');

function App() {
  // State for connection status and data from ESP32
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  const [cutLength, setCutLength] = useState("000.000");
  const [cutQuantity, setCutQuantity] = useState("00000");
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  // const [serialData, setTravelDistance] = useState(""); // State to hold raw serial data
  // const [encoderCount, setEncoderCount] = useState(0); // State to hold encoder count
  // const [cutQuantity, setCutQuantity] = useState("");
  // // const [travelDistance, setTravelDistance] = useState(0); // Store travel distance as a string
  // Emit changes to the server
  // useEffect(() => {
  //   if (cutLength !== "000.000") {
  //     socket.emit("updateCutLength", cutLength);
  //   }
  // }, [cutLength]);

  // useEffect(() => {
  //   if (cutQuantity !== "00000") {
  //     socket.emit("updateCutQuantity", cutQuantity);
  //   }
  // }, [cutQuantity]);

  // const handleCutLengthChange = (e) => {
  //   setCutLength(e.target.value);
  // };

  // const handleCutQuantityChange = (e) => {
  //   setCutQuantity(e.target.value);
  // };

  useEffect(() => {
    // Emit initial values on component mount (optional)
    socket.emit("initialData", { cutLength, cutQuantity });
  }, []);

  const handleOpenKeypad = (inputType) => {
    console.log(`Opening keypad for: ${inputType}`);
    setActiveInput(inputType);
    setShowKeypad(true);
  };

  const handleKeypadSubmit = (value) => {
    if (activeInput === "cutLength") {
      setCutLength(value);
      socket.emit("updateCutLength", value); // Emit the cut length value
    } else if (activeInput === "cutQuantity") {
      setCutQuantity(value);
      socket.emit("updateCutQuantity", value); // Emit the cut quantity value
    }
    setActiveInput(null);
    setShowKeypad(false); // Close the keypad after submitting
  };


  // Use useEffect to handle WebSocket events
  useEffect(() => {
    // // On WebSocket connection
    socket.on("connect", () => {
      setConnectionStatus("Connected");
    });

    // // On WebSocket disconnection
    socket.on("disconnect", () => {
      setConnectionStatus("Disconnected");
    });

    // socket.on("travel_distance", (distance) => {
    //   console.log("Received travel distance:", distance);
    //   setTravelDistance(distance); // Handle the travel distance data
    // });

    // Listen for encoder count data from the ESP32
    // socket.on("encoder_count", (count) => {
    //   setEncoderCount(count); // Update state with encoder count
    // });

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
      <div className="cut-data-section"> 
        <div className="display-box-container">
        <label className="display-label">Cut Length</label>
        <div className="display-box">
          <input
            type="text"
            className="display-input"
            value={cutLength} readOnly
            // onChange={handleCutLengthChange}
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
            value={cutQuantity} readOnly
            // onChange={handleCutQuantityChange}
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
    

      <div className="display-section">
        <DisplayBox label="Cut Count" value="00000" />
        <DisplayBox label="Cut Cycle Time" value="000.00" />
        <DisplayBox label="Live Cut Feed" value="000.000" />
      </div>

      <div className="control-section">
        <div className="control-column">
          <button className="control-button">Start / Pause</button>
          <button className="control-button">Reset</button>
          <button className="control-button blue-button">Encoder<br />Calibration</button>
        </div>
        <div className="control-column">
          <button className="control-button">Material Forward</button>
          <button className="control-button">Manual Shear</button>
          <button className="control-button">Screen Unlocked</button>
          <div className="image-container">
            <IndicatorLight label="Load Material" color="yellow" />
          </div>
          <button className="e-stop-button">E Stop</button>
        </div>
      </div>
    </div>
  );
}
//   return (
//     <div className="app">
//       <h1 className="heading">SPARK ROBOTIC X LEISURECRAFT</h1>
//       <div className="display-section"> 
//         <DisplayBox label="Cut Length" value="000.000" />
//         <InputButton label="Input Length" />
//         <DisplayBox label="Cut Quantity" value="00000" />
//         <InputButton label="Input Quantity" />
//       </div>
//       <div className="display-section">
//         <DisplayBox label="Cut Count" value="00000" />
//         <DisplayBox label="Cut Cycle Time" value="000.00" />
//         <DisplayBox label="Live Cut Feed" value="000.000" />
//       </div>
//       <div className="control-section">
//   <div className="control-column">
//     <button className="control-button">Start / Pause</button>
//     <button className="control-button">Reset</button>
//     <button className="control-button blue-button">Encoder <br></br> Calibration</button>
//   </div>
//   <div className="control-column">
//     <button className="control-button">Material Forward</button>
//     <button className="control-button">Manual Shear</button>
//     <button className="control-button">Screen Unlocked</button>

//     {/* Indicator Lights and E-Stop Button */}
//     <div className="image-container">
//       <IndicatorLight label="Load Material" color="yellow" />
  
//       </div>
//       <button className="e-stop-button">E Stop</button>
//     </div>
//   </div>
// </div>
    
      
      
      
      
      /* <div className="control-section">
        <div className="control-column">
          <button className="control-button">Start / Pause</button>
          <button className="control-button">Reset</button>
          <button className="control-button blue-button">Encoder Calibration</button>
        </div>
        <div className="control-column">
          <button className="control-button">Material Forward</button>
          <button className="control-button">Manual Shear</button>
          <button className="control-button">Screen Unlocked</button>
        </div>
        <div className="indicator-section">
          <IndicatorLight label="Load Material" color="yellow" />
          <IndicatorLight label="ERROR" color="red" />
          <EStopButton label="E Stop" />
        </div>
      </div>
    </div> */
//   );
// }

export default App;
