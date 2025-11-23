import { useEffect, useState } from 'react';

export type Token = {
  userid: string;
  accesstoken: string;
  authorization: string;
}

type TokenHook = {
  token: Token | null;
  removeToken: () => void;
}

export default function App(): TokenHook {
  const [token, setToken] = useState<Token | null>(null);
  useEffect(() => {
    if (token != null) return;
    chrome.storage.session.get("orchid-authorization").then((response) => {
      if (response && response["orchid-authorization"]) {
        const authtokens = JSON.parse(response["orchid-authorization"])
        setToken(authtokens)
      } else {
        chrome.runtime.sendMessage({ type: 'ORCHID-AUTHORIZATION' })
      }
    })
  }, [token])
  const removeToken = () => {
    chrome.storage.session.remove("orchid-authorization");
    setToken(null);
  }
  return { token, removeToken };
};
