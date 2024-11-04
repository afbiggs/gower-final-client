// import './components/style/App.css';
// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import RelayButton from './components/relaybuttons';  // Import the RelayButton component
// // import EncoderDisplay from './components/encoderdisplay'; // Import the DisplayData component for the encoder data
// import DisplayData from './components/encoderdisplay';

// // Establish a WebSocket connection to the Node.js server
// const socket = io('http://192.168.8.212:4100');

// function App() {
//   // State for connection status and travel distance from the encoder
//   const [connectionStatus, setConnectionStatus] = useState('Disconnected');
//   const [travelDistance, setTravelDistance] = useState(0); // State to store travel distance

//   // Use useEffect to handle WebSocket events
//   useEffect(() => {
//     // On WebSocket connection
//     socket.on('connect', () => {
//       setConnectionStatus('Connected');
//     });

//     // On WebSocket disconnection
//     socket.on('disconnect', () => {
//       setConnectionStatus('Disconnected');
//     });

//     // Listen for travel distance data from the server
//     // Listen for travel distance data
//   socket.on('travel_distance', (distance) => {
//     console.log('Received travel distance:', distance);
//     setTravelDistance(parseFloat(distance)); // Update the travel distance
//   });
//     // Cleanup event listeners on component unmount
//     return () => {
//       socket.off('connect');
//       socket.off('disconnect');
//       socket.off('travel_distance');
//     };
//   }, []);

//   return (
//     <div>
//       <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
//         <h1>ESP32 Relay Control</h1>

//         {/* Display relay buttons */}
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
//           {[...Array(8)].map((_, index) => (
//             <RelayButton key={index} relayNumber={index + 1} socket={socket} />
//           ))} 
//         </div>

//         {/* Display connection status */}
//         <h2 style={{ color: connectionStatus === 'Connected' ? 'green' : 'red' }}>
//           Status: {connectionStatus}
//         </h2>

//         {/* Display the travel distance */}
//         <div>
//           <h2>Travel Distance</h2>
//           <DisplayData /> {/* Display the travel distance */}
//           {/* <p>{!isNaN(travelDistance) ? travelDistance.toFixed(4) : 'N/A'} inches</p> Show the travel distance */}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;


// import './components/style/App.css';
// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import RelayButton from './components/relaybuttons';  // Import the RelayButton component
// import DisplayData from './components/encoderdisplay';

// // Establish a WebSocket connection to the Node.js server
// const socket = io('http://192.168.8.212:4100');

// function App() {
//   // State for connection status and data from ESP32
//   const [connectionStatus, setConnectionStatus] = useState('Disconnected');
//   const [travelDistance, setTravelDistance] = useState('');

//   // Use useEffect to handle WebSocket events
//   useEffect(() => {
//     // On WebSocket connection
//     socket.on('connect', () => {
//       setConnectionStatus('Connected');
//     });

//     // On WebSocket disconnection
//     socket.on('disconnect', () => {
//       setConnectionStatus('Disconnected');
//     });

//     // Listen for data from the ESP32
//     socket.on('esp32_data', (data) => {
//       setDataFromESP32(data);
//     });

//     // Cleanup event listeners on component unmount
//     return () => {
//       socket.off('connect');
//       socket.off('disconnect');
//       socket.off('esp32_data');
//     };
//   }, []);

//   return (
//     <div>
//       <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
//         <h1>ESP32 Relay Control</h1>

//         {/* Display relay buttons */}
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
//           {[...Array(8)].map((_, index) => (
//             <RelayButton key={index} relayNumber={index + 1} socket={socket} />
//           ))} 
//         </div>

//         {/* Display connection status */}
//         <h2 style={{ color: connectionStatus === 'Connected' ? 'green' : 'red' }}>
//           Status: {connectionStatus}
//         </h2>

//         {/* Display data from the ESP32 */}
//         <div className="DisplayData">
          
//           <div>
//             {/* <h2>Raw Serial Data</h2> */}
//             <DisplayData /> {/* Display the raw serial data */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;


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
  // const [serialData, setTravelDistance] = useState(""); // State to hold raw serial data
  // const [encoderCount, setEncoderCount] = useState(0); // State to hold encoder count
  // const [cutQuantity, setCutQuantity] = useState("");
  // // const [travelDistance, setTravelDistance] = useState(0); // Store travel distance as a string
  // Emit changes to the server
  useEffect(() => {
    if (cutLength !== "000.000") {
      socket.emit("updateCutLength", cutLength);
    }
  }, [cutLength]);

  useEffect(() => {
    if (cutQuantity !== "00000") {
      socket.emit("updateCutQuantity", cutQuantity);
    }
  }, [cutQuantity]);

  const handleCutLengthChange = (e) => {
    setCutLength(e.target.value);
  };

  const handleCutQuantityChange = (e) => {
    setCutQuantity(e.target.value);
  };

  // const handleInputChange = (e) => {
  //   setCutQuantity(e.target.value);
  // };

  // const sendCutQuantity = () => {
  //   if (cutQuantity) {
  //     socket.emit("setCutQuantity", cutQuantity);
  //   }
  // };

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
            value={cutLength}
            onChange={handleCutLengthChange}
          />
          </div>
          <InputButton label="Input Length" />
        </div>
        
        <div className="display-box-container">
          <label className="display-label">Cut Quantity</label>
          <div className="display-box">
          <input
            type="text"
            className="display-input"
            value={cutQuantity}
            onChange={handleCutQuantityChange}
          />
          </div>
          <InputButton label="Input Quantity" />
        </div>
      </div>
    

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
