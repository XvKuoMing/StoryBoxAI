// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import IntroForm from './components/IntroForm';
import ScenarioSelection from './components/ScenarioSelection';
import GameInterface from './components/GameInterface';

function App() {
  const [playerInfo, setPlayerInfo] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [settings, setSettings] = useState({
    backgroundSound: false, // Set to false by default
    showPopupHint: false,
  });

  const handleIntroSubmit = (info) => {
    setPlayerInfo(info);
  };

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
  };

  const handleExit = () => {
    setPlayerInfo(null);
    setSelectedScenario(null);
  };

  const updateSettings = (newSettings) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  const audioRef = useRef(null);

  useEffect(() => {
    if (settings.backgroundSound) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Autoplay prevented:', error);
        });
      }
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [settings.backgroundSound]);

  return (
    <>
      <audio ref={audioRef} src="/assets/background.mp3" loop />
      {/* Render the appropriate component */}
      {!playerInfo ? (
        <IntroForm
          onSubmit={handleIntroSubmit}
          settings={settings}
          updateSettings={updateSettings}
        />
      ) : !selectedScenario ? (
        <ScenarioSelection
          name={playerInfo.name}
          genre={playerInfo.genre}
          onSelectScenario={handleScenarioSelect}
          settings={settings}
          updateSettings={updateSettings}
        />
      ) : (
        <GameInterface
          name={playerInfo.name}
          genre={playerInfo.genre}
          scenario={selectedScenario}
          onExit={handleExit}
          updateSettings={updateSettings}
          settings={settings}
        />
      )}
    </>
  );
}

export default App;




