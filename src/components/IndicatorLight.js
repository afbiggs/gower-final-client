// // import React from "react";
// // import "./style/IndicatorLight.css";

// // function IndicatorLight({ label }) {
// //   return (
// //     // <div className="indicator-light">
// //     <div>
// //       <div className = "image-container">
// //         <img src="/images/load-material-icon.png" alt="load-indicator" className="load-material-icon"/>
// //         <img src="/images/load-material-!.png" alt="overlay" className="load-material-overlay"/>
// //         <img src="/images/error-icon.png" alt="error-indicator" className="error-icon"/>
// //         <img src="/images/error-!.png" alt="overlay" className="error-overlay"/>
// //           <div>
// //         {/* <div className={`light ${color}`}></div> */}
// //         <p className="light-label">{label}</p>
// //         </div>
// //       </div>
// //       {/* <div className = "error-indicator">
// //         <img src="/images/error-icon.png" alt="error-indicator" className="error-icon"/>
// //         <img src="/images/error-!.png" alt="overlay" className="error-overlay"/>
// //         {/* <div className={`light ${color}`}></div> */}
       
      
// //     </div> 
// //   );
// // }

// import React from "react";
// import "./style/IndicatorLight.css";

// function IndicatorLight() {
//   return (
//     <div className="indicator-container">
//       {/* Yellow Triangle */}
//       <div className="indicator">
//         <div className="triangle-container">
//           <img
//             src="/images/load-material-icon.png"
//             alt="load-indicator"
//             className="triangle-icon"
//           />
//           <img
//             src="/images/load-material-!.png"
//             alt="overlay"
//             className="overlay-icon"
//           />
//         </div>
//         <p className="indicator-label">Load Material</p>
//       </div>

//       {/* Red Triangle */}
//       <div className="indicator">
//         <div className="triangle-container">
//           <img
//             src="/images/error-icon.png"
//             alt="error-indicator"
//             className="triangle-icon"
//           />
//           <img
//             src="/images/error-!.png"
//             alt="overlay"
//             className="overlay-icon"
//           />
//         </div>
//         <p className="indicator-label">Error</p>
//       </div>
//     </div>
//   );
// }

// export default IndicatorLight;


// import React from "react";
// import "./style/IndicatorLight.css";

// function IndicatorLight() {
//   return (
//     <div className="indicator-container">
//       {/* Load Material Icon */}
//       <div className="indicator-item">
//         <div className="icon-wrapper">
//           <img
//             src="/images/load-material-icon.png"
//             alt="load-material"
//             className="load-icon"
//           />
//           <img
//             src="/images/load-material-!.png"
//             alt="load-material-overlay"
//             className="overlay"
//           />
//         </div>
//         <p className="indicator-label">Load Material</p>
//       </div>

//       {/* Error Icon */}
//       <div className="indicator-item">
//         <div className="icon-wrapper">
//           <img
//             src="/images/error-icon.png"
//             alt="error"
//             className="error-icon"
//           />
//           <img
//             src="/images/error-!.png"
//             alt="error-overlay"
//             className="overlay"
//           />
//         </div>
//         <p className="indicator-label">Error</p>
//       </div>

//       {/* E-Stop Button */}
//       <button className="estop-button">E Stop</button>
//     </div>
//   );
// }

// export default IndicatorLight;


import React from "react";
import "./style/IndicatorLight.css";

function IndicatorLight() {
  return (
    <div className="indicator-container">
      {/* Load Material Icon */}
      <div className="indicator-item">
        <div className="icon-wrapper">
          <img
            src="/images/load-material-icon.png"
            alt="load-material"
            className="material-icon"
          />
          <img
            src="/images/load-material-!.png"
            alt="load-material-overlay"
            className="overlay"
          />
        </div>
        <p className="indicator-label">Load Material</p>
      </div>

      {/* Error Icon */}
      <div className="indicator-item">
        <div className="icon-wrapper">
          <img
            src="/images/error-icon.png"
            alt="error"
            className="error-icon"
          />
          <img
            src="/images/error-!.png"
            alt="error-overlay"
            className="overlay"
          />
        </div>
        <p className="indicator-label">Error</p>
      </div>

      {/* E-Stop Button */}
      <div className="indicator-item">
        <button className="estop-button">E Stop</button>
      </div>
    </div>
  );
}

export default IndicatorLight;
