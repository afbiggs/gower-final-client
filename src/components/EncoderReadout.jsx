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

