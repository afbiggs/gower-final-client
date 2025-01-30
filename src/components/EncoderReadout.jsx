import React, { useState, useEffect } from "react";

function EncoderDisplay({ socket, resetTrigger }) {
  const [travelDistance, setTravelDistance] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  useEffect(() => {
    socket.on("connect", () => {
      setConnectionStatus("Connected");
      console.log("Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("Disconnected");
      console.log("Disconnected from WebSocket server");
    });

    socket.on("travel_distance", (distance) => {
      console.log("Received travel distance:", distance);
      setTravelDistance(distance);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("travel_distance");
    };
  }, [socket]);

  // ✅ Reset Live Cut Feed when resetTrigger changes
  useEffect(() => {
    console.log("Reset Trigger Detected: Resetting Live Cut Feed...");
    setTravelDistance(0);
  }, [resetTrigger]);

  return (
    <div style={{ color: "white", padding: "50px", textAlign: "center" }}>
      <h1>Encoder Travel Distance</h1>

      <h2 style={{ color: connectionStatus === "Connected" ? "green" : "red" }}>
        Status: {connectionStatus}
      </h2>

      <div className="DisplayData">
        <h2>Travel Distance</h2>
        <p>{travelDistance.toFixed(3)} in</p>
      </div>
    </div>
  );
}

export default EncoderDisplay;



// import React, { useState, useEffect } from 'react';

// function EncoderDisplay({ socket, resetTrigger, startTrigger }) {
//   const [travelDistance, setTravelDistance] = useState(0);
//   const [connectionStatus, setConnectionStatus] = useState('Disconnected');
//   const [isResetting, setIsResetting] = useState(false); // Prevents overwrite after reset

//   useEffect(() => {
//     // WebSocket connection event
//     socket.on('connect', () => {
//       setConnectionStatus('Connected');
//       console.log('Connected to WebSocket server');
//     });

//     // WebSocket disconnection event
//     socket.on('disconnect', () => {
//       setConnectionStatus('Disconnected');
//       console.log('Disconnected from WebSocket server');
//     });

//     // Listen for travel distance updates from the server
//     socket.on('travel_distance', (data) => {
//       if (!isResetting) {
//         console.log('Received travel distance:', data);
//         setTravelDistance(Number(data.travelDistance));
//       }
//     });

//     // Cleanup event listeners when the component unmounts
//     return () => {
//       socket.off('connect');
//       socket.off('disconnect');
//       socket.off('travel_distance');
//     };
//   }, [socket, isResetting]);

//   // Reset travel distance when resetTrigger changes
//   useEffect(() => {
//     setIsResetting(true); // Prevent overwriting
//     setTravelDistance(0);
//     console.log("Travel Distance reset.");
    
//     // Allow updates again after a short delay
//     setTimeout(() => {
//       setIsResetting(false);
//     }, 500);
//   }, [resetTrigger]);

//   // Reset travel distance when startTrigger changes (when start button is pressed)
//   useEffect(() => {
//     setIsResetting(true);
//     setTravelDistance(0);
//     console.log("Travel Distance reset on start.");
    
//     setTimeout(() => {
//       setIsResetting(false);
//     }, 500);
//   }, [startTrigger]);

//   return (
//     <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
//       <h1>Encoder Travel Distance</h1>

//       {/* Display connection status */}
//       <h2 style={{ color: connectionStatus === 'Connected' ? 'green' : 'red' }}>
//         Status: {connectionStatus}
//       </h2>

//       {/* Display travel distance */}
//       <div className="DisplayData">
//         <h2>Travel Distance</h2>
//         <p>{travelDistance.toFixed(3)} in</p>
//       </div>
//     </div>
//   );
// }

// export default EncoderDisplay;






// import React, { useState, useEffect } from 'react';


// function EncoderDisplay() {
//   const [travelDistance, setTravelDistance] = useState(); // State to store travel distance
//   const [connectionStatus, setConnectionStatus] = useState('Disconnected'); // Connection status
 

//   useEffect(() => {
//     // On WebSocket connection
//     socket.on('connect', () => {
//       setConnectionStatus('Connected');
//       console.log('Connected to WebSocket server');
//     });

//     // On WebSocket disconnection
//     socket.on('disconnect', () => {
//       setConnectionStatus('Disconnected');
//       console.log('Disconnected from WebSocket server');
//     });

//     // Listen for travel distance event from the server
//     socket.on('travel_distance', (distance) => {
//       console.log('Received travel distance:', distance);
//       setTravelDistance(distance); // Update the travel distance in state
//     });

//     // Cleanup event listeners on component unmount
//     return () => {
//       socket.off('connect');
//       socket.off('disconnect');
//       socket.off('travel_distance');
//     };
//   }, []);

//   return (
//     <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
//       <h1>Encoder Travel Distance</h1>

//       {/* Display connection status */}
//       <h2 style={{ color: connectionStatus === 'Connected' ? 'green' : 'red' }}>
//         Status: {connectionStatus}
//       </h2>

//       {/* Display travel distance */}
//       <div className="DisplayData">
//         <h2>Travel Distance</h2>
//         <p>{travelDistance}</p>
//       </div>
//     </div>
//   );
// }

// export default EncoderDisplay;

