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
  const actions: Array<{ title: string, color: string, callback: () => void }> = [
    { title: "FORM 1", color: "bg-rose-500", callback: () => {onCallback('shallow')} },
    { title: "FORM 2", color: "bg-emerald-500", callback: () => {onCallback('deep')} },
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
  const connectToBackend = async () => {
    try {
      if (token == null) throw new Error("You don't have a session id!")
      // Get bundle of invoices.
      const requestOtf = await fetch("https://api.mahindradealerrise.com/otf/vehicleinvoice/search?searchType=invoiceNumber&searchParam=" + search + "&pageNumber=1&pageSize=10&invoiceStatus=I&sortBy=modelDescription&sortIn=DESC", {
        headers: {
          accept: "application/json, text/plain, */*",
          ...token,
        }
      })
      if (requestOtf.status == 401) {
        removeToken();
        throw new Error("Your robin session has been expired!");
      }
      const responseOtf = await requestOtf.json()
      const firstInvoice = responseOtf["data"]["paginationData"][0]
      const { id: invoiceId, otfNumber } = firstInvoice;
      // Get full data of the invoice.
      const request = await fetch(`https://api.mahindradealerrise.com/otf/vehicleinvoice/details?invoiceId=${invoiceId}&otfNumber=${otfNumber}`, {
        headers: {
          accept: "application/json, text/plain, */*",
          ...token,
        }
      })
      const response = await request.json()
      const customerInfo = response["data"]["invoiceDetails"]["bookingAndBillingCustomerDto"]["bookingCustomer"]
      const vehicleInfo = response["data"]["vehicleDetails"]
      const rawAddress = customerInfo["address1"] + customerInfo["address2"] + customerInfo["address3"]
      const fields: Vehicle = {
        model: vehicleInfo["model"],
        invoice: response["data"]["invoiceDetails"]["invoiceNumber"],
        name: customerInfo["customerName"],
        streetName: "",
        addressLine1: "",
        addressLine2: "",
        district: customerInfo["district"],
        state: customerInfo["state"],
        pincode: customerInfo["pincode"],
        phoneno: customerInfo["mobileNumber"],
        email: customerInfo["email"],
        vinno: vehicleInfo["vinNumber"],
      }
      const address = await extractAddress(rawAddress);
      fields.streetName = address.streetName
      fields.addressLine1 = address.addressLine1
      fields.addressLine2 = address.addressLine2
      chrome.storage.session.set({ "shadow-invoice": JSON.stringify(fields) })
      setVehicle(fields)
    } catch (e) {
      console.log(e);
      if (e instanceof Error) setException(e.message);
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
      {exception && <div className="text-sm mt-3 p-3 flex flex-row text-red-500 font-bold bg-red-100 border-1 rounded-md">
        <Info className="mr-1 size-4"/>
        {exception}
      </div>}
    </div>
  )
}
