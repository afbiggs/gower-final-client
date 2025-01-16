import React, { useState, useEffect } from "react";
import DisplayBox from "./DisplayBox";
import InputButton from "./InputButton";
import NumericKeypad from "./NumericKeypad";

function CutQuantity({ isLocked, socket }) {
  const [cutQuantity, setCutQuantity] = useState("");
  const [showKeypad, setShowKeypad] = useState(false);

  useEffect(() => {
    socket.on("updateCutQuantity", (data) => {
      setCutQuantity(data);
    });

    return () => {
      socket.off("updateCutQuantity"); // Cleanup listener
    };
  }, [socket]);

  const handleOpenKeypad = () => {
    if (!isLocked) {
      setShowKeypad(true);
    }
  };

  const handleKeypadSubmit = (value) => {
    setCutQuantity(value);
    socket.emit("setCutQuantity", value);
    setShowKeypad(false);
  };

  return (
    <div className="display-box-container">
      <DisplayBox label="Cut Quantity" value={cutQuantity || "00000"} onClick={handleOpenKeypad} />

      <InputButton onClick={handleOpenKeypad} disabled={isLocked}>
        Input Quantity
      </InputButton>

      {showKeypad && (
        <NumericKeypad
          onClose={() => setShowKeypad(false)}
          onSubmit={handleKeypadSubmit}
          allowDecimal={false}
        />
      )}
    </div>
  );
}

export default CutQuantity;


// import React, { useState, useEffect } from "react";
// import DisplayBox from "./DisplayBox";
// import InputButton from "./InputButton";
// import io from 'socket.io-client';


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

//   useEffect(() => {
//     socket.on('connect', () => {
//       console.log('Connected to server');
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   return (
//     <div className="cut-quantity-input">
//       <DisplayBox label="Cut Quantity" value={cutQuantity || "00000"} />
//       <input
//         type="number"
//         value={cutQuantity}
//         onChange={handleInputChange}
//         placeholder="00000"
//         className="cut-quantity-input-field"
//       />
//       <InputButton onClick={sendCutQuantity}>Input Quantity</InputButton>
//     </div>
//   );
// }

// export default CutQuantity;
