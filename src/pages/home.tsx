import { useState } from "react";
import { Loader, Search } from "lucide-react";

type InvoiceType = {
  phoneno: string,
  vinno: string,
  name: string,
  email: string,
  addressLine1: string,
  addressLine2: string,
  streetName: string,
  district: string,
  state: string,
  pincode: number
}

export default function App() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceType | undefined>()
  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
  };
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
      <div>
        <form onSubmit={handleSearch} className="flex flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="Feed me a invoice no."
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !search.trim()}
            className="bg-green-600 ml-2 p-3 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader className="animate-spin"/> : <Search/>}
          </button>
        </form>
      </div>
      {invoice && <div className="flex flex-row mt-2">
        <div className="font-mono mr-2 w-3xs">
          <p className="font-bold">INV2324325</p>
          <hr/>
          <p><b>Name: </b>Harsh Vairagi</p>
          <p><b>Phone: </b>78228238</p>
          <p><b>VIN: </b>Harsh Vairagi</p>
          <p className="truncate"><b>Address: </b>K2ewfkcnwonef weofknwkono woefnewkofnwo</p>
          <p><b>Name: </b>Harsh Vairagi</p>
        </div>
        <button
          className="bg-rose-500 font-mono rounded-sm mr-2 px-2 h-min text-nowrap"
        >
          Form I
        </button>
        <button
          className="bg-emerald-500 font-mono rounded-sm px-2 h-min text-nowrap"
        >
          Form II
        </button>
        <button/>
      </div>}
    </div>
  )
}
