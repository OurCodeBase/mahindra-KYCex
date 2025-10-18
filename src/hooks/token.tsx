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
    if (token != null) return;
    chrome.storage.session.get("robin-authtokens").then((response) => {
      if (response && response["robin-authtokens"]) {
        const authtokens = JSON.parse(response["robin-authtokens"])
        setToken(authtokens)
      } else {
        chrome.runtime.sendMessage({ type: 'FIND_TOKENS' })
      }
    })
  }, [token])
  return { token, setToken };
};
