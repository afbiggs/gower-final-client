import React, {useState} from 'react';
import io from 'socket.io-client';

const socket = io('http://192.168.8.212:4100'); // Ensure the IP and port are correct

function cutLength() {
    const [cutLength, setCutLength] = useState('');

    const handleInputLength = (e) => {
        setCutLength(e.target.value);
    };

    const sendCutLength = () => {
        socket.emit('setCutLength', cutLength);
    };

    return (
        <div className="CutLength">
            <h2>Cut Length</h2>
            <input 
                type="number"
                value={cutLength}
                onChange={handleInputLength}
                placeholder='00000'
            />
            <button onClick={sendCutLength}>Input Length</button>
        </div>
    );
}