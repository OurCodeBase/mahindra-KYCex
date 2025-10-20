import { useToken } from "../hooks";
import { Logo } from "../components";
import { useEffect, useState } from "react";
import { extractAddress } from "../google-genai";
import { Info, Loader, Search } from "lucide-react";

type Vehicle = {
  model: string,
  invoice: string,
  name: string,
  streetName: string,
  addressLine1: string,
  addressLine2: string,
  district: string,
  state: string,
  pincode: string,
  phoneno: string,
  email: string,
  vinno: string,
}

type ActionType = 'shallow' | 'deep';
type ActionsProps = { vehicle: Vehicle, setVehicle: (vehicle: Vehicle | undefined ) => void }

function handleShallowForm(vehicle: Vehicle) {
  const fields: Array<{ loc: string, key?: keyof Vehicle }> = [
    { loc: "#wyhMobile", key: "phoneno" },
    { loc: "#vinNumber", key: "vinno" },
    { loc: "#polygon" },
    { loc: "#newDistribution > div.form-row > div > button:nth-child(1)" },
  ]
  fields.forEach(({ loc, key }) => {
    const element = document.querySelector<HTMLInputElement | HTMLButtonElement>(loc);
    if (element == null) return;
    if (key) {
      element.value = vehicle[key];
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      element.click();
    }
  })
}

function handleDeepForm(vehicle: Vehicle) {
  const fields: Array<{ loc: string, key: keyof Vehicle }> = [
    { loc: "#Prefered\\ Mobile\\ Number", key: "phoneno" },
    { loc: "#address1", key: "addressLine1" },
    { loc: "#Address\\ Line\\ 1", key: "addressLine1" },
    { loc: "#Address\\ Line\\ 2", key: "addressLine2" },
    { loc: "#Street\\ Name", key: "streetName" },
    { loc: "#District", key: "district" },
    { loc: "#stateAdd", key: "state" },
    { loc: "#Pincode", key: "pincode" },
  ]
  fields.forEach(({ loc, key }) => {
    const element = document.querySelector<HTMLInputElement | HTMLSelectElement>(loc);
    if (element == null) return;
    element.value = vehicle[key];
    element.dispatchEvent(new Event('change', { bubbles: true }));
  })
}

function Actions({ vehicle, setVehicle }: ActionsProps ) {
  const onCallback = async (type: ActionType) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: type == "shallow" ? handleShallowForm : handleDeepForm,
        args: [vehicle]
      })
    }
  }
  const actionBtns: Array<{ title: string, color: string, callback: () => void }> = [
    {
      title: "FORM 1",
      color: "bg-rose-500",
      callback: () => {onCallback('shallow')}
    },
    {
      title: "FORM 2",
      color: "bg-emerald-500",
      callback: () => {onCallback('deep')}
    },
    {
      title: "CLEAR",
      color: "bg-slate-500",
      callback: () => {
        chrome.storage.session.remove("shadow-invoice");
        setVehicle(undefined);
      }
    },
  ]
  return (
    <div className="w-full flex justify-center mt-2">
      {actionBtns.map(option => <button onClick={option.callback} key={option.title}
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
  const connectToBackend = async () => {
    try {
    if (!token) return;
    // Get list of invoices.
    const searchRequest = await fetch(`https://api.mahindradealerrise.com/otf/vehicleinvoice/search?searchType=invoiceNumber&searchParam=${search}&pageNumber=1&pageSize=10&invoiceStatus=I&sortBy=modelDescription&sortIn=DESC`, {
      headers: {
        accept: "application/json, text/plain, */*",
        ...token,
      }
    })
    // Check for unauthorization.
    if (searchRequest.status == 401) {
      removeToken();
      setLoading(false);
      return;
    }
    const searchResponse = await searchRequest.json()
    if (!searchRequest.ok) {
      const exception = {
        invoice: search,
        tokens: token,
        response: searchResponse
      }
      setException(JSON.stringify(exception))
      return;
    }
    // Get full data of the invoice.
    const firstInvoice = searchResponse["data"]["paginationData"][0]
    const { id: invoiceId, otfNumber } = firstInvoice
    const request = await fetch(`https://api.mahindradealerrise.com/otf/vehicleinvoice/details?invoiceId=${invoiceId}&otfNumber=${otfNumber}`, {
      headers: {
        accept: "application/json, text/plain, */*",
        ...token,
      }
    })
    const response = await request.json()
    const cupcakes = response["data"]["invoiceDetails"]["bookingAndBillingCustomerDto"]["bookingCustomer"]
    const vanilla = response["data"]["vehicleDetails"]
    const unstructuredAddress = cupcakes["address1"] + cupcakes["address2"] + cupcakes["address3"]
    const chocolate: Vehicle = {
      model: vanilla["model"],
      invoice: response["data"]["invoiceDetails"]["invoiceNumber"],
      name: cupcakes["customerName"],
      streetName: "",
      addressLine1: "",
      addressLine2: "",
      district: cupcakes["district"],
      state: cupcakes["state"],
      pincode: cupcakes["pincode"],
      phoneno: cupcakes["mobileNumber"],
      email: cupcakes["email"],
      vinno: vanilla["vinNumber"],
    }
    const address = await extractAddress(unstructuredAddress);
    chocolate.streetName = address.streetName
    chocolate.addressLine1 = address.addressLine1
    chocolate.addressLine2 = address.addressLine2
    chrome.storage.session.set({ "shadow-invoice": JSON.stringify(chocolate) })
    setVehicle(chocolate)
    } catch (e) {
    console.log(e);
    setException("Something went wrong...");
    } finally {
    setLoading(false);
    }
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
      if (response && response["shadow-invoice"]) setVehicle(JSON.parse(response["shadow-invoice"]))
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
      {exception && <div className="text-sm font-mono mt-3 p-3 flex flex-row text-red-500 font-bold bg-red-100 border-1 rounded-md">
        <Info className="mr-1 size-4"/>
        {exception}
      </div>}
    </div>
  )
}
