// src/components/Popup.jsx
import React from 'react';
import './Popup.css';

function Popup({ onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <img src="/assets/pandora.png" alt="Hint" />
        <p>Добро пожаловать в StoryBoxAI! Это дом воображения и свободы выражения. Поэтому давайте начнем с ваших предпочтений</p>
        <button onClick={onClose}>Понял</button>
      </div>
    </div>
  );
}

export default Popup;

