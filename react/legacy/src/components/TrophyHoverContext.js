import React, { createContext, useState, useContext } from 'react';

const TrophyHoverContext = createContext();
export const useTrophyHover = () => useContext(TrophyHoverContext);

export const TrophyHoverProvider = ({ children }) => {
  const [hoveredName, setHoveredName] = useState(null);

  const value = {
    hoveredName,
    setHoveredName
  };

  return (
    <TrophyHoverContext.Provider value={value}>
      {children}
    </TrophyHoverContext.Provider>
  );
};
