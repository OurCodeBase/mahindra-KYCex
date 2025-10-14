import { useToken } from "../hooks";
import { Logo } from "../components";
import { useEffect, useState } from "react";
import { extractAddress } from "../google-genai";
import { Info, Loader, Search } from "lucide-react";

type Invoice = {
  model: string,
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
  const { token, setToken } = useToken()
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | undefined>()
  const [exception, setException] = useState<string | undefined>()
  const connectToBackend = async () => {
    if (!token) return null;
    const request = await fetch('http://localhost:5000/api/invoice', {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accesstoken": token.accesstoken,
        "authorization": token.authorization,
        "userid": token.userid
      }
    })
    // Check for unauthorization.
    if (!request.ok) {
      if (request.status == 401) setToken(null);
      return;
    }
    const response = await request.json()
    const cupcakes = response["data"]["invoiceDetails"]["bookingAndBillingCustomerDto"]["bookingCustomer"]
    const vanilla = response["data"]["vehicleDetails"]
    const unstructuredAddress = cupcakes["address1"]
    const chocolate: Invoice = {
      model: vanilla["model"],
      phoneno: cupcakes["mobileNumber"],
      vinno: vanilla["vinNumber"],
      name: cupcakes["customerName"],
      email: cupcakes["email"],
      addressLine1: "",
      addressLine2: "",
      streetName: "",
      district: cupcakes["district"],
      state: cupcakes["state"],
      pincode: cupcakes["pincode"],
    }
    const address = await extractAddress(unstructuredAddress);
    chocolate.streetName = address.streetName
    chocolate.addressLine1 = address.addressLine1
    chocolate.addressLine2 = address.addressLine2
    chrome.storage.session.set({ "shadow-invoice": JSON.stringify(chocolate) })
    setInvoice(chocolate)
    setLoading(false);
  }
  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setException(undefined);
    connectToBackend();
  }
  useEffect(() => {
    chrome.storage.session.get("shadow-invoice").then((response) => {
      if (response && response["shadow-invoice"]) setInvoice(JSON.parse(response["shadow-invoice"]))
    })
  }, [])
  return (
    <div className="shadow-xl p-4 max-w-md">
      <Logo/>
      <form onSubmit={handleSearch} className={`flex flex-row w-full justify-center ${invoice || "pb-28"}`}>
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
      {invoice && <div className="mt-2">
        <div className="backdrop-brightness-60 backdrop-contrast-125 font-mono border-1 border-stone-400 rounded-md p-2">
          <p className="font-bold text-lime-50">INV2324325</p>
          <hr className="text-stone-400 mb-1"/>
          <table className="text-lime-50">
            <tbody>
              {(Object.entries(invoice) as [keyof Invoice, Invoice[keyof Invoice]][]).map(
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
            className="py-2 shadow-lg bg-rose-500 opacity-70 cursor-pointer text-green-100 font-mono mr-2 px-2 h-min text-nowrap"
          >
            FORM 1
          </button>
          <button
            className="py-2 shadow-lg bg-emerald-500 opacity-70 cursor-pointer text-green-100 font-mono mr-2 px-2 h-min text-nowrap"
          >
            FORM 2
          </button>
          <button
            className="py-2 shadow-lg bg-slate-500 opacity-70 cursor-pointer text-green-100 font-mono px-2 h-min text-nowrap"
            onClick={() => {
              chrome.storage.session.remove("shadow-invoice");
              setInvoice(undefined);
            }}
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
