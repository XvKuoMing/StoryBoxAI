// src/components/GameInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import Popup from './Popup';
import useShowPopup from '../hooks/useShowPopup';
import './GameInterface.css';

function GameInterface({ name, genre, scenario, onExit, settings, updateSettings }) {
  const [dialog, setDialog] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [stats, setStats] = useState({ HP: 100, HUNGER: 0 });
  const [history, setHistory] = useState([]);
  const [finished, setFinished] = useState(false);
  const dialogEndRef = useRef(null);
  const [showPopup, setShowPopup] = useShowPopup(settings.showPopupHint);
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingsChange = (e) => {
    const { name, checked } = e.target;
    updateSettings({ [name]: checked });

    if (name === 'showPopupHint' && !checked) {
      setShowPopup(false);
    }
  };

  const scrollToBottom = () => {
    dialogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message) => {
    const payload = {
      name,
      genre,
      scenario,
      user: message,
      history,
    };

    try {
      const response = await fetch('http://127.0.0.1:8080/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let receivedText = '';
      let serverStats = null;
      let finishStatus = null;
      let buffer = ''; // To accumulate incomplete data between chunks

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Split the buffer by newline to get complete JSON objects
        let lines = buffer.split('\n');
        buffer = lines.pop(); // Save the incomplete part back to the buffer

        for (let line of lines) {
          if (line.trim() === '') continue;

          let data;
          try {
            data = JSON.parse(line);
          } catch (e) {
            console.error('Error parsing JSON:', e);
            continue;
          }

          if (data.token) {
            receivedText += data.token;
            setDialog((prev) => {
              // Remove previous assistant message if it exists
              if (prev.length > 0 && prev[prev.length - 1].role === 'assistant') {
                prev = prev.slice(0, -1);
              }
              return [...prev, { role: 'assistant', content: receivedText }];
            });
          }

          if (data.stats) {
            serverStats = data.stats;
          }

          if (data.finish) {
            finishStatus = data.finish;
          }
        }
      }

      // Handle any remaining data in the buffer
      if (buffer.trim() !== '') {
        try {
          const data = JSON.parse(buffer);
          if (data.token) {
            receivedText += data.token;
            setDialog((prev) => {
              if (prev.length > 0 && prev[prev.length - 1].role === 'assistant') {
                prev = prev.slice(0, -1);
              }
              return [...prev, { role: 'assistant', content: receivedText }];
            });
          }
          if (data.stats) {
            serverStats = data.stats;
          }
          if (data.finish) {
            finishStatus = data.finish;
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }

      // Update stats if any
      if (serverStats) {
        const statUpdate = JSON.parse(serverStats);
        setStats((prevStats) => {
          const operation = statUpdate.operation;
          const value = Number(statUpdate.value);
          const stat = statUpdate.stat;
          let newValue = prevStats[stat];

          switch (operation) {
            case '+':
              newValue += value;
              break;
            case '-':
              newValue -= value;
              break;
            // case '*':
            //   newValue *= value;
            //   break;
            // case '/':
            //   newValue /= value;
            //   break;
            default:
              break;
          }

          return { ...prevStats, [stat]: newValue };
        });
      }

      if (finishStatus) {
        setFinished(true);
        alert(finishStatus === '<WIN>' ? 'Вы выйграли игру' : 'Вы проиграли игру');
      }

      // Update the conversation history
      setHistory((prevHistory) => [
        ...prevHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: receivedText },
      ]);
    } catch (error) {
      console.error('Error communicating with the server:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() === '') return;
    setDialog((prev) => [...prev, { role: 'user', content: userInput }]);
    sendMessage(userInput);
    setUserInput('');
  };

  useEffect(() => {
    // Start the game when the component mounts
    sendMessage('');
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [dialog]);

  return (
    <div className="game-interface">
      {showPopup && <Popup onClose={() => setShowPopup(false)} />}
      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <h3>Настройки</h3>
            <label>
              <input
                type="checkbox"
                name="backgroundSound"
                checked={settings.backgroundSound}
                onChange={handleSettingsChange}
              />
              Фоновый звук
            </label>
            <label>
              <input
                type="checkbox"
                name="showPopupHint"
                checked={settings.showPopupHint}
                onChange={handleSettingsChange}
              />
              Подсказки
            </label>
            <button onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}
      <div className="top-bar">
        <button className="settings-button" onClick={() => setShowSettings(true)}>
          Settings
        </button>
        <div className="stats">
          <p>HP: {stats.HP}</p>
          <p>ГОЛОД: {stats.HUNGER}</p>
        </div>
        <button onClick={onExit}>Закрыть</button>
      </div>
      <div className="dialog-container">
        {dialog.map((entry, index) => (
          <div key={index} className={`dialog-entry ${entry.role}`}>
            <p>{entry.content}</p>
          </div>
        ))}
        <div ref={dialogEndRef} />
      </div>
      {!finished && (
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            placeholder="ваши действия..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            required
          />
          <button type="submit">Действовать</button>
        </form>
      )}
    </div>
  );
}

export default GameInterface;