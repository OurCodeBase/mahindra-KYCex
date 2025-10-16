import { useEffect, useState } from 'react';

type Token = {
  userid: string;
  accesstoken: string;
  authorization: string;
}

type TokenHook = {
  token: Token | null;
  setToken: (token: Token | null) => void;
}

export default function App(): TokenHook {
  const [token, setToken] = useState<Token | null>(null);
  useEffect(() => {
    console.log("Checking token availablity...")
    chrome.storage.session.get("robin-authtokens").then((response) => {
      if (response && response["robin-authtokens"]) {
        const authtokens = JSON.parse(response["robin-authtokens"])
        setToken(authtokens)
      } else {
        console.log("Calling web request for tokens...");
        chrome.runtime.sendMessage({ type: 'FIND_TOKENS' })
      }
    })
  }, [token])
  return { token, setToken };
};
