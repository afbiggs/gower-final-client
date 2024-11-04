import React, { useState, useEffect } from "react";
import DisplayBox from "./DisplayBox";
import InputButton from "./InputButton";
import io from 'socket.io-client';

const socket = io('http://192.168.8.212:4100'); // Ensure the IP and port are correct

function CutQuantity() {
  const [cutQuantity, setCutQuantity] = useState('');

  const handleInputChange = (e) => {
    setCutQuantity(e.target.value);
  };

  const sendCutQuantity = () => {
    if (cutQuantity) {
      socket.emit('setCutQuantity', cutQuantity);
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="cut-quantity-input">
      <DisplayBox label="Cut Quantity" value={cutQuantity || "00000"} />
      <input
        type="number"
        value={cutQuantity}
        onChange={handleInputChange}
        placeholder="00000"
        className="cut-quantity-input-field"
      />
      <InputButton onClick={sendCutQuantity}>Input Quantity</InputButton>
    </div>
  );
}

export default CutQuantity;


// import React, { useState, useEffect } from "react";
// import DisplayBox from "./DisplayBox";
// import InputButton from "./InputButton";



// import io from 'socket.io-client';

// const socket = io('http://192.168.8.212:4100'); // Ensure the IP and port are correct

// function CutQuantity() {
//   const [cutQuantity, setCutQuantity] = useState('');

//   const handleInputChange = (e) => {
//     setCutQuantity(e.target.value);
//   };

//   const sendCutQuantity = () => {
//     if (cutQuantity) {
//       socket.emit('setCutQuantity', cutQuantity);
//     }
//   };

//   return (
//     <div className="cut-quantity-Input">
//       <h2>Cut Quantity</h2>
//       <DisplayBox
//         type="number"
//         value={cutQuantity}
//         onChange={handleInputChange}
//         placeholder="00000"
//       />
//       <InputButton onClick={sendCutQuantity}>Input Quantity</InputButton>
//     </div>
//   );
// }

// export default CutQuantity;


