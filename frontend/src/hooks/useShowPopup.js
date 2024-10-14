// src/hooks/useShowPopup.js
import { useState, useEffect } from 'react';

function useShowPopup(showPopupHint) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (showPopupHint) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [showPopupHint]);

  return [showPopup, setShowPopup];
}

export default useShowPopup;


