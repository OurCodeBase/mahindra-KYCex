import { useEffect, useRef, useState, type ReactNode } from "react";
import { Logo } from "../components";
import authgen from '../authgen'
import { Info } from "lucide-react";

export default function App({ children }: {children: ReactNode}) {
  const [code, setCode] = useState<number | undefined>()
  const [badSteps, setbadSteps] = useState<number>(0)
  const iRef = useRef<(HTMLInputElement | null)>(null);
  const handleInput = (s: string) => {
    if (s.length == 6) {
      if (s == authgen()) {
        chrome.storage.session.set({ 'morse-code': code });
        setCode(parseInt(authgen()));
      }
      else setbadSteps(badSteps + 1);
    }
  }
  useEffect(() => {
    if (badSteps >= 3) {
      if (iRef.current) {
        iRef.current.value = "";
        iRef.current.disabled = true;
        iRef.current.placeholder = "You are locked!";
      }
    }
  }, [badSteps])
  useEffect(() => {
    chrome.storage.session.get("morse-code").then((response) => {
      if (response && response["morse-code"]) setCode(parseInt(response["morse-code"]));
    })
  }, [])
  return code ? children : (
    <div>
      <Logo/>
      <div className="w-full flex justify-center pb-15">
        <input
          ref={iRef}
          type="text"
          maxLength={6}
          inputMode="numeric"
          onChange={e => {handleInput(e.currentTarget.value)}}
          placeholder="Enter OTP to continue"
          className="px-4 bg-green-50 text-green-600 placeholder-stone-400 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all cursor-pointer"
        />
      </div>
      {(badSteps > 0) && <div className="text-sm font-mono mt-3 p-3 flex flex-row text-red-500 font-bold bg-red-100 border-1">
        <Info className="mr-1 size-4"/>
        You have been tried {(badSteps == 3) && "all"} {badSteps} attempts to enter OTP!
      </div>}
    </div>
  )
}
