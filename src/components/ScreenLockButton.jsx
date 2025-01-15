import React, { useState } from "react";
import "./style/ScreenLockButton.css";

const ScreenLockButton = ({ isLocked, onToggleLock }) => {
  const [enteredPin, setEnteredPin] = useState(""); // Tracks the entered PIN
  const [showPinPrompt, setShowPinPrompt] = useState(false); // Toggles PIN prompt visibility
  const correctPin = "1234"; // Correct PIN (replace with environment variable in production)

  const handleButtonClick = (value) => {
    // Add the clicked number to the PIN
    setEnteredPin((prev) => prev + value);
  };

  const handleClear = () => {
    // Clear the entered PIN
    setEnteredPin("");
  };

  const handleSubmit = () => {
    // Check if the entered PIN matches
    if (enteredPin === correctPin) {
      onToggleLock(); // Unlock the screen
      setShowPinPrompt(false); // Close the PIN prompt
      setEnteredPin(""); // Clear the entered PIN
    } else {
      alert("Incorrect PIN!");
      setEnteredPin(""); // Clear the incorrect PIN
    }
  };

  const handleLockClick = () => {
    if (isLocked) {
      setShowPinPrompt(true); // Show the PIN prompt when locked
    } else {
      onToggleLock(); // Lock the screen directly
    }
  };

  return (
    <div>
      <button
        className={`screen-lock-button ${isLocked ? "locked" : ""}`}
        onClick={handleLockClick}
      >
        {isLocked ? "Screen Locked" : "Screen Unlocked"}
      </button>

      {showPinPrompt && (
        <div className="pin-prompt">
          <h3>Enter PIN to Unlock</h3>
          <div className="pin-display">{enteredPin.replace(/./g, "*")}</div>
          <div className="pin-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
              <button
                key={number}
                className="lock-pin-keypad-button"
                onClick={() => handleButtonClick(number.toString())}
              >
                {number}
              </button>
            ))}
          </div>
          <div className="keypad-actions">
            <button className="keypad-button clear" onClick={handleClear}>
              Clear
            </button>
            <button className="keypad-button submit" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenLockButton;




// import React, { useState } from "react";
// import "./style/ScreenLockButton.css";

// const ScreenLockButton = ({ isLocked, onToggleLock }) => {
//   const [pin, setPin] = useState(""); // State to track the entered PIN
//   const [showPinPrompt, setShowPinPrompt] = useState(false); // State to toggle PIN prompt visibility
//   const correctPin = "1234"; // Correct PIN for unlocking (move to environment variables for better security)

//   const handleUnlock = () => {
//     if (pin === correctPin) {
//       onToggleLock(); // Unlock the screen
//       setShowPinPrompt(false); // Hide the PIN prompt
//       setPin(""); // Clear the PIN input
//     } else {
//       alert("Incorrect PIN!");
//       setPin(""); // Clear the incorrect input
//     }
//   };

//   const handleLockClick = () => {
//     if (isLocked) {
//       setShowPinPrompt(true); // Show the PIN prompt when trying to unlock
//     } else {
//       onToggleLock(); // Directly lock the screen
//     }
//   };

//   return (
//     <div>
//       <button
//         className={`screen-lock-button ${isLocked ? "locked" : ""}`}
//         onClick={handleLockClick}
//       >
//         {isLocked ? "Screen Locked" : "Screen Unlocked"}
//       </button>

//       {showPinPrompt && (
//         <div className="pin-prompt">
//           <h3>Enter PIN to Unlock</h3>
//           <input
//             type="password"
//             value={pin}
//             onChange={(e) => setPin(e.target.value)}
//             placeholder="Enter PIN"
//           />
//           <button onClick={handleUnlock}>Submit</button>
//           <button onClick={() => setShowPinPrompt(false)}>Cancel</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ScreenLockButton;



// import React from "react";
// import "./style/ScreenLockButton.css";

// const ScreenLockButton = ({ isLocked, onToggleLock }) => {
//   return (
//     <button
//       className={`screen-lock-button ${isLocked ? "locked" : ""}`}
//       onClick={onToggleLock}
//     >
//       {isLocked ? "Screen Locked" : "Screen Unlocked"}
//     </button>
//   );
// };

// export default ScreenLockButton;
