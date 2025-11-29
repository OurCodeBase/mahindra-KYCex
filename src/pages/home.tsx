import { useToken } from "@/hooks";
import { Logo } from "@/components";
import { useEffect, useState } from "react";
import { Loader, Search } from "lucide-react";
import { Searchconsole } from "@/utils/search";
import { fillFirstform, fillSecondform, sendPdfDocument } from '@/utils/actions';

import type { Vehicle } from '@/types';

type ActionsProps = { vehicle: Vehicle, setVehicle: (vehicle: Vehicle | undefined ) => void }

function Actions({ vehicle, setVehicle }: ActionsProps ) {
  type FillType = 'first' | 'second';
  const onClear = () => {
    chrome.storage.session.remove("shadow-invoice");
    setVehicle(undefined);
  }
  const onCallback = async (type: FillType) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: type == 'first' ? fillFirstform : fillSecondform,
        args: [vehicle]
      })
    }
  }
  const actions: Array<{ title: string, color: string, callback: () => void }> = [
    { title: "FORM 1", color: "bg-rose-500", callback: () => {onCallback('first')} },
    { title: "FORM 2", color: "bg-emerald-500", callback: () => {onCallback('second')} },
    { title: "PRINT", color: "bg-indigo-500", callback: () => {sendPdfDocument(vehicle)} },
    { title: "CLEAR", color: "bg-slate-500", callback: () => {onClear()} },
  ]
  return (
    <div className="w-full flex justify-center mt-2">
      {actions.map(option => <button onClick={option.callback} key={option.title}
        className={`py-2 shadow-lg ${option.color} opacity-70 cursor-pointer text-green-100 font-mono mr-2 px-2 h-min text-nowrap`}>
        {option.title}
      </button>)}
    </div>
  )
}

export default function App() {
  const { token, removeToken } = useToken()
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | undefined>()
  const [exception, setException] = useState<string | undefined>()
  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setException(undefined);
    try {
      if (!token) throw new Error("You don't have a session id!")
      const searchconsole = new Searchconsole(token, search);
      const vehicle = await searchconsole.getVehicledata();
      chrome.storage.session.set({ "shadow-invoice": JSON.stringify(vehicle) });
      setVehicle(vehicle);
    } catch (e) {
      if (!(e instanceof Error)) return console.error(e);
      setException(e.message);
      if (e.name == "AUTHORIZATION-REVOKED") removeToken();
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    chrome.storage.session.get("shadow-invoice").then((response) => {
      if (response && response["shadow-invoice"])
        setVehicle(JSON.parse(response["shadow-invoice"]))
    })
  }, [])
  return (
    <div className="shadow-xl p-4 max-w-md">
      <Logo/>
      <form onSubmit={handleSearch} className={`flex flex-row w-full justify-center ${vehicle || "pb-28"}`}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value.toUpperCase())}
          placeholder="Feed me a invoice no."
          className="px-4 bg-green-50 text-green-600 placeholder-stone-400 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all cursor-pointer"
        />
        <button
          type="submit"
          disabled={loading || !search.trim()}
          className="bg-lime-600 ml-2 p-3 hover:bg-lime-700 text-lime-100 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader className="animate-spin"/> : <Search/>}
        </button>
      </form>
      {vehicle && <div className="mt-2">
        <div className="backdrop-brightness-60 backdrop-contrast-125 font-mono border-1 border-stone-400 rounded-md p-2">
          <table className="text-lime-50">
            <tbody>
              {(Object.entries(vehicle) as [keyof Vehicle, Vehicle[keyof Vehicle]][]).map(
                ([key, value]) => {
                  return <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                }
              )}
            </tbody>
          </table>
        </div>
        <Actions vehicle={vehicle} setVehicle={setVehicle}/>
      </div>}
      {exception && <div className="text-sm font-bold mt-3 p-3 text-red-500 bg-red-100 border-1 rounded-md">
        {exception}
      </div>}
    </div>
  )
}
