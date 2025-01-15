import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import DisplayBox from './DisplayBox';
import InputButton from './InputButton';


function CutLength() {
    const [cutLength, setCutLength] = useState('');

    const handleInputLength = (e) => {
        setCutLength(e.target.value);
    };

    const sendCutLength = () => {
        socket.emit('setCutLength', cutLength);
    };

    useEffect(() => {
        // Optional: Handle socket connection and disconnection
        socket.on('connect', () => {
            console.log('Connected to server');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="cut-length-input">
            <h2>Cut Length</h2>
            <DisplayBox label="Cut Length" value={cutLength || '00000'} />
            <input
                type="number"
                value={cutLength}
                onChange={handleInputLength}
                placeholder="00000"
                className="cut-length-input"
            />
            <InputButton onClick={sendCutLength}>Input Length</InputButton>
        </div>
    );
}

export default CutLength;
