import React, { useState } from 'react';
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

  return (
    <div className="cut-quantity-frame">
      <div className="cut-length-parent">
        <div className="cut-length">Cut Quantity</div>
        <div className="cut-coount-inner">
          <div className="container">
            <input
              type="number"
              className="div"
              value={cutQuantity}
              onChange={handleInputChange}
              placeholder="00000"
            />
          </div>
        </div>
      </div>
      <div className="cut-quantity-frame-inner">
        <div className="input-quantity-wrapper">
          <button className="input-length" onClick={sendCutQuantity}>
            Input Quantity
          </button>
        </div>
      </div>
    </div>
  );
}

export default CutQuantity;

// import React, { useState } from 'react';
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
//     <div className="cut-quantity">
//       <h2>Cut Quantity</h2>
//       <input
//         type="number"
//         value={cutQuantity}
//         onChange={handleInputChange}
//         placeholder="00000"
//       />
//       <button onClick={sendCutQuantity}>Input Quantity</button>
//     </div>
//   );
// }

// export default CutQuantity;


