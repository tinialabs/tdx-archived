import React, { useContext } from 'react'

export const TDXContext = React.createContext({})

export const TDXProvider = ({ components, children }) => (
  <TDXContext.Provider value={components || {}}>{children}</TDXContext.Provider>
)

export const useTDXContext = () => useContext(TDXContext)