import React, { useState, useEffect } from "react";
import DisplayBox from "./DisplayBox";
import InputButton from "./InputButton";
import NumericKeypad from "./NumericKeypad";
import "./style/DisplayBox.css";

function CutLength({ isLocked, socket }) {
  const [cutLength, setCutLength] = useState("");
  const [showKeypad, setShowKeypad] = useState(false);

  useEffect(() => {
    socket.on("updateCutLength", (data) => {
      setCutLength(data);
    });

    return () => {
      socket.off("updateCutLength"); // Cleanup listener
    };
  }, [socket]);

  const handleOpenKeypad = () => {
    if (!isLocked) {
      setShowKeypad(true);
    }
  };

  const handleKeypadSubmit = (value) => {
    setCutLength(value);
    socket.emit("setCutLength", value);
    setShowKeypad(false);
  };

  return (
    <div className="display-box-container">
      <DisplayBox 
        label="Cut Length" 
        
        value={cutLength ? `${parseFloat(cutLength).toFixed(3)} in` : "00.000 in "} 
        onClick={handleOpenKeypad} 
      />

      <InputButton
            label="Input Length"
            onClick={() => !isLocked && handleOpenKeypad("cutLength")}
            disabled={isLocked}
        />

      {showKeypad && (
        <NumericKeypad
          onClose={() => setShowKeypad(false)}
          onSubmit={handleKeypadSubmit}
          allowDecimal={true}
        />
      )}
    </div>
  );
}

export default CutLength;


// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import DisplayBox from './DisplayBox';
// import InputButton from './InputButton';


// function CutLength() {
//     const [cutLength, setCutLength] = useState('');

//     const handleInputLength = (e) => {
//         setCutLength(e.target.value);
//     };

//     const sendCutLength = () => {
//         socket.emit('setCutLength', cutLength);
//     };

//     useEffect(() => {
//         // Optional: Handle socket connection and disconnection
//         socket.on('connect', () => {
//             console.log('Connected to server');
//         });

//         return () => {
//             socket.disconnect();
//         };
//     }, []);

//     return (
//         <div className="cut-length-input">
//             <h2>Cut Length</h2>
//             <DisplayBox label="Cut Length" value={cutLength || '00000'} />
//             <input
//                 type="number"
//                 value={cutLength}
//                 onChange={handleInputLength}
//                 placeholder="00000"
//                 className="cut-length-input"
//             />
//             <InputButton onClick={sendCutLength}>Input Length</InputButton>
//         </div>
//     );
// }

// export default CutLength;
