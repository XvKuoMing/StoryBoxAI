// src/components/ScenarioSelection.jsx
import React, { useState, useEffect } from 'react';
import Popup from './Popup';
import useShowPopup from '../hooks/useShowPopup';
import './ScenarioSelection.css';

function ScenarioSelection({ name, genre, onSelectScenario, settings, updateSettings }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useShowPopup(settings.showPopupHint);
  const [showSettings, setShowSettings] = useState(false);

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8080/scenarios/${genre}`);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 200 && data.result) {
        setScenarios(data.result);
      } else {
        console.error('Error fetching scenarios:', data);
        setScenarios([]);
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      setScenarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [genre]);

  const handleSettingsChange = (e) => {
    const { name, checked } = e.target;
    updateSettings({ [name]: checked });

    if (name === 'showPopupHint' && !checked) {
      setShowPopup(false);
    }
  };

  return (
    <div className="scenario-selection">
      {showPopup && <Popup onClose={() => setShowPopup(false)} />}
      <div className="top-bar">
        <button className="settings-button" onClick={() => setShowSettings(true)}>
          Settings
        </button>
      </div>
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
            <button onClick={() => setShowSettings(false)}>Закрыть</button>
          </div>
        </div>
      )}
      <h2>Выберите сценарий</h2>
      {loading ? (
        <p>Загружаем сценарии...</p>
      ) : scenarios.length > 0 ? (
        <>
          <ul>
            {scenarios.map((scenario, index) => (
              <li key={index} onClick={() => onSelectScenario(scenario)}>
                {scenario}
              </li>
            ))}
          </ul>
          <button className="regenerate-button" onClick={fetchScenarios}>
            Придумать другие сценарии
          </button>
        </>
      ) : (
        <p>Мы не получили никаких сценариев</p>
      )}
    </div>
  );
}

export default ScenarioSelection;
