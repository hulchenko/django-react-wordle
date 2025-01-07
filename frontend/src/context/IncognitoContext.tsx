import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import detectIncognito from "detectincognitojs";

interface Props {
  children?: ReactNode;
}

const IncognitoContext = createContext(false);

const IncognitoStateProvider = ({ children }: Props) => {
  const [isPrivate, setIsPrivate] = useState(false);

  const incognitoHandler = async () => {
    try {
      const response = await detectIncognito();
      const { isPrivate, browserName } = response;
      if (browserName) {
        setIsPrivate(isPrivate);
      }
    } catch (error) {
      console.error("Error evaluating browser's privacy.");
    }
  };

  useEffect(() => {
    incognitoHandler();
  }, []);

  return <IncognitoContext.Provider value={isPrivate}>{children}</IncognitoContext.Provider>;
};

const useIncognitoState = () => {
  return useContext(IncognitoContext);
};

export { IncognitoStateProvider, useIncognitoState };
