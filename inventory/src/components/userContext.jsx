import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userDataExists, setUserDataExists] = useState(!!localStorage.getItem('userData'));

  const updateUserData = (data) => {
    if (data) {
      localStorage.setItem('userData', JSON.stringify(data));
      setUserDataExists(true);
    } else {
      localStorage.removeItem('userData');
      setUserDataExists(false);
    }
  };

  return (
    <UserContext.Provider value={{ userDataExists, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
