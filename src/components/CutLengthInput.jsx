import React, { useState, useEffect } from "react";
import DisplayBox from "./DisplayBox";
import InputButton from "./InputButton";
import NumericKeypad from "./NumericKeypad";
import "./style/DisplayBox.css";

function CutLength({ isLocked, socket, resetTrigger }) {
  const [cutLength, setCutLength] = useState("");
  const [showKeypad, setShowKeypad] = useState(false);

  // Listen for updates from the server
  useEffect(() => {
    socket.on("updateCutLength", (data) => {
      setCutLength(data);
    });

    return () => {
      socket.off("updateCutLength"); // Cleanup listener
    };
  }, [socket]);

  // Reset cutLength when resetTrigger changes
  useEffect(() => {
    setCutLength("00.000"); // Reset the cut length to default
    console.log("Cut Length reset.");
  }, [resetTrigger]); // Runs whenever resetTrigger changes

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
        value={cutLength ? `${parseFloat(cutLength).toFixed(3)} in` : "00.000 in"} 
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




// import React, { useState, useEffect } from "react";
// import DisplayBox from "./DisplayBox";
// import InputButton from "./InputButton";
// import NumericKeypad from "./NumericKeypad";
// import "./style/DisplayBox.css";

// function CutLength({ isLocked, socket }) {
//   const [cutLength, setCutLength] = useState("");
//   const [showKeypad, setShowKeypad] = useState(false);

//   useEffect(() => {
//     socket.on("updateCutLength", (data) => {
//       setCutLength(data);
//     });

//     return () => {
//       socket.off("updateCutLength"); // Cleanup listener
//     };
//   }, [socket]);

//   const handleOpenKeypad = () => {
//     if (!isLocked) {
//       setShowKeypad(true);
//     }
//   };

//   const handleKeypadSubmit = (value) => {
//     setCutLength(value);
//     socket.emit("setCutLength", value);
//     setShowKeypad(false);
//   };

//   return (
//     <div className="display-box-container">
//       <DisplayBox 
//         label="Cut Length" 
        
//         value={cutLength ? `${parseFloat(cutLength).toFixed(3)} in` : "00.000 in "} 
//         onClick={handleOpenKeypad} 
//       />

//       <InputButton
//             label="Input Length"
//             onClick={() => !isLocked && handleOpenKeypad("cutLength")}
//             disabled={isLocked}
//         />

//       {showKeypad && (
//         <NumericKeypad
//           onClose={() => setShowKeypad(false)}
//           onSubmit={handleKeypadSubmit}
//           allowDecimal={true}
//         />
//       )}
//     </div>
//   );
// }

// export default CutLength;
