import React from "react";
import "./style/DisplayBox.css";

function DisplayBox({ label, value, onClick }) {
  return (
    <div className="display-container">
      <p className="display-label">{label}</p>
      {/* Make the display box clickable */}
      <div className="display-box" onClick={onClick} style={{ cursor: "pointer" }}>
        {value}
      </div>
    </div>
  );
}

export default DisplayBox;





// import React from "react";
// import "./style/DisplayBox.css";

// function DisplayBox({ label, value }) {
//   return (
//     <div className="display-container">
//       <p className="display-label">{label}</p>
//       <div className="display-box">{value}</div>
//     </div>
//   );
// }

// export default DisplayBox;
