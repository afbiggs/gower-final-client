import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Connect to the Socket.IO server
const socket = io('http://192.168.8.212:4100'); // Ensure the IP and port are correct

function EncoderDisplay() {
  const [travelDistance, setTravelDistance] = useState(); // State to store travel distance
  const [connectionStatus, setConnectionStatus] = useState('Disconnected'); // Connection status
 

  useEffect(() => {
    // On WebSocket connection
    socket.on('connect', () => {
      setConnectionStatus('Connected');
      console.log('Connected to WebSocket server');
    });

    // On WebSocket disconnection
    socket.on('disconnect', () => {
      setConnectionStatus('Disconnected');
      console.log('Disconnected from WebSocket server');
    });

    // Listen for travel distance event from the server
    socket.on('travel_distance', (distance) => {
      console.log('Received travel distance:', distance);
      setTravelDistance(distance); // Update the travel distance in state
    });

    // Cleanup event listeners on component unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('travel_distance');
    };
  }, []);

  return (
    <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
      <h1>Encoder Travel Distance</h1>

      {/* Display connection status */}
      <h2 style={{ color: connectionStatus === 'Connected' ? 'green' : 'red' }}>
        Status: {connectionStatus}
      </h2>

      {/* Display travel distance */}
      <div className="DisplayData">
        <h2>Travel Distance</h2>
        <p>{travelDistance}</p>
      </div>
    </div>
  );
}

export default EncoderDisplay;



// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';


// // Connect to the Socket.IO server
// const socket = io('http://192.168.8.212:4100'); // Replace with your server's address if it's different

// function DisplayData() {
//   const [serialData, setSerialData] = useState('');   // To hold raw serial data
//   const [encoderCount, setEncoderCount] = useState(0); // To hold the encoder count

//   useEffect(() => {
//     // Listen for incoming serial data
//     socket.on('serial_data', (data) => {
//       console.log('Received serial data:', data);
//       setSerialData(data); // Update the state with the received serial data
//     });

//     // Listen for the encoder count data
//     socket.on('encoder_count', (count) => {
//       console.log('Received encoder count:', count);
//       setEncoderCount(count); // Update the state with the received encoder count
//     });

//     // Cleanup when the component unmounts
//     return () => {
//       socket.off('serial_data');
//       socket.off('encoder_count');
//     };
//   }, []); // Empty dependency array means this useEffect runs only once when the component mounts

//   return (
//     <div className="DisplayData">
//       <h1>ESP32 Data Dashboard</h1>

//       <div>
//         <h2>Raw Serial Data</h2>
//         <p>{serialData}</p>  {/* Display the raw serial data */}
//       </div>

//       <div>
//         <h2>Encoder Count</h2>
//         <p>{encoderCount}</p>  {/* Display the encoder count */}
//       </div>
//     </div>
//   );
// }

// export default DisplayData;









// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';

// // Connect to the Socket.IO server
// const socket = io('http://192.168.8.212:4100'); // Ensure this is the correct server IP and port

// function EncoderDisplay() {
//   const [travelDistance, setTravelDistance] = useState(0); // State to hold the travel distance
//   const [isConnected, setIsConnected] = useState(false);  // State to track Socket.IO connection status

//   useEffect(() => {
//     // Socket.IO connection event
//     socket.on('connect', () => {
//       console.log('Connected to Socket.IO server');
//       setIsConnected(true); // Set connected status
//     });

//     // Socket.IO disconnection event
//     socket.on('disconnect', () => {
//       console.log('Disconnected from Socket.IO server');
//       setIsConnected(false); // Set disconnected status
//     });

//     // Listen for the 'travel_distance' event from the server
//     socket.on('travel_distance', (distance) => {
//       if (!isNaN(distance)) {
//         console.log('Received travel distance:', distance);
//         setTravelDistance(parseFloat(distance)); // Update state with valid travel distance
//       } else {
//         console.error('Received invalid travel distance:', distance);
//       }
//     });

//     // Cleanup when the component unmounts
//     return () => {
//       socket.off('connect');
//       socket.off('disconnect');
//       socket.off('travel_distance');
//     };
//   }, []); // Empty dependency array means this useEffect runs only once when the component mounts

//   return (
//     <div className="App">
//       <h1>Travel Distance Dashboard</h1>

//       <div>
//         <h2>Status: {isConnected ? 'Connected' : 'Disconnected'}</h2>
//         <h2>Travel Distance</h2>
//         <p>{!isNaN(travelDistance) ? travelDistance.toFixed(4) : 'N/A'} inches</p>  {/* Display travel distance or 'N/A' */}
//       </div>
//     </div>
//   );
// }

// export default EncoderDisplay;




// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://192.168.8.212:4100'); // Ensure this is the correct server IP and port

// function EncoderDisplay() {
//   const [travelDistance, setTravelDistance] = useState(0); // State to hold the travel distance

//   useEffect(() => {
//     // Listen for the travel distance data from the server
//     socket.on('travel_distance', (distance) => {
//       console.log('Received travel distance:', distance);
//       setTravelDistance(parseFloat(distance)); // Update state with valid travel distance
//     });

//     // Cleanup when the component unmounts
//     return () => {
//       socket.off('travel_distance');
//     };
//   }, []);

//   return (
//     <div className="DisplayData">
//       <h2>Travel Distance</h2>
//       <p>{!isNaN(travelDistance) ? travelDistance.toFixed(4) : 'N/A'} inches</p>  {/* Display travel distance */}
//     </div>
//   );
// }

// export default EncoderDisplay;


