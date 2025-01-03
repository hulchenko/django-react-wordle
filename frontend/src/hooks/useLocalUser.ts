import { useState } from "react";

interface User {
  nickname: string;
  email: string;
}

export const useLocalUser = (key: string = "user", defaultUser: User = { nickname: "", email: "" }) => {
  const [localUserValue, setLocalUserValue] = useState(() => {
    // set initial value: local if exists, default if doesn't
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value);
    } else {
      localStorage.setItem(key, JSON.stringify(defaultUser));
      return defaultUser;
    }
  });

  const setLocalUserState = (val: User) => {
    // update state + local value
    localStorage.setItem(key, JSON.stringify(val));
    setLocalUserValue(val);
  };

  return [localUserValue, setLocalUserState];
};
