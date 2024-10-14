// src/components/IntroForm.jsx
import React, { useState } from 'react';
import Popup from './Popup';
import useShowPopup from '../hooks/useShowPopup';
import './IntroForm.css';

function IntroForm({ onSubmit, settings, updateSettings }) {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPopup, setShowPopup] = useShowPopup(settings.showPopupHint);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, genre });
  };

  const handleSettingsChange = (e) => {
    const { name, checked } = e.target;
    updateSettings({ [name]: checked });

    // If popup hint is turned off, close any existing popup
    if (name === 'showPopupHint' && !checked) {
      setShowPopup(false);
    }
  };

  return (
    <div className="intro-form">
      {showPopup && <Popup onClose={() => setShowPopup(false)} />}
      <div className="top-bar">
        <button className="settings-button" onClick={() => setShowSettings(true)}>
          Настройки
        </button>
      </div>
      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <h3>Settings</h3>
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
      <form onSubmit={handleSubmit}>
        <h2>StoryBoxAI</h2>
        <input
          type="text"
          placeholder="Введите ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select value={genre} onChange={(e) => setGenre(e.target.value)} required>
          <option value="" disabled>
            Выберите жанр
          </option>
          <option value="фэнтези">Фэнтези</option>
          <option value="sci-fi">Sci-Fi</option>
          <option value="Ужасы">Ужасы</option>
          <option value="Романтика">Романтика</option>
        </select>
        <button type="submit">Придумать сценарий</button>
      </form>
    </div>
  );
}

export default IntroForm;


