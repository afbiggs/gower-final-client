import React from "react";
import "./style/ConfirmationDialog.css";

function ConfirmationDialog({ value, onConfirm, onCancel }) {
    return (
        <div className="confirmation-overlay">
            <div className="confirmation-dialog">
                <p className="confirmation-message">Confirm the input: {value}</p>
                <div className="confirmation-buttons">
                    <button className="confirm-button" onClick={onConfirm}>Confirm</button>
                    <button className="cancel-button" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationDialog;