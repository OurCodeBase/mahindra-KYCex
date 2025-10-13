import { useState } from "react";
import { Logo } from "../components";
import { Info, Loader, Search } from "lucide-react";

type Ainvoice = {
  phoneno: string,
  vinno: string,
  name: string,
  email: string,
  addressLine1: string,
  addressLine2: string,
  streetName: string,
  district: string,
  state: string,
  pincode: string,
}

export default function App() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Ainvoice | undefined>()
  const [exception, setException] = useState<string | undefined>()
  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setException(undefined);
    setTimeout(() => {
      setException("Hello World!")
      setLoading(false);
    }, 300);
  };
  return (
    <div className="shadow-xl p-4 max-w-md">
      <Logo/>
      <form onSubmit={handleSearch} className="flex flex-row w-full justify-center">
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
      {data && <div className="mt-2">
        <div className="backdrop-blur-lg font-mono border-1 border-stone-400 rounded-md p-2">
          <p className="font-bold text-lime-50">INV2324325</p>
          <hr className="text-stone-400 mb-1"/>
          <table className="text-lime-50">
            <tbody>
              {(Object.entries(data) as [keyof Ainvoice, Ainvoice[keyof Ainvoice]][]).map(
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
        <div className="w-full flex justify-center mt-2">
          <button
            className="py-2 shadow-lg bg-rose-600 cursor-pointer text-green-100 font-mono mr-2 px-2 h-min text-nowrap"
          >
            FORM 1
          </button>
          <button
            className="py-2 shadow-lg bg-emerald-600 cursor-pointer text-green-100 font-mono mr-2 px-2 h-min text-nowrap"
          >
            FORM 2
          </button>
          <button
            className="py-2 shadow-lg bg-slate-600 cursor-pointer text-green-100 font-mono px-2 h-min text-nowrap"
            onClick={() => {setData(undefined)}}
          >
            CLEAR
          </button>
        </div>
      </div>}
      {exception && <div className="text-sm font-mono mt-3 p-3 flex flex-row text-red-500 font-bold bg-red-100 border-1 rounded-md">
        <Info className="mr-1 size-4"/>
        {exception}
      </div>}
    </div>
  )
}
