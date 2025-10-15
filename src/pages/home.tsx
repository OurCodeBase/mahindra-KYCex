import { useToken } from "../hooks";
import { Logo } from "../components";
import { useEffect, useState } from "react";
import { extractAddress } from "../google-genai";
import { Info, Loader, Search } from "lucide-react";

type Invoice = {
  invoice: string,
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
type ButtonType = 'SHALLOW' | 'FULL'
type ActionsProps = { details: Invoice, setDetails: (details: Invoice | undefined ) => void }
type ActionBtn = { title: string, color: string, onClick: () => void }

function Actions({ details, setDetails }: ActionsProps ) {
  const handleShallowForm = (details: Invoice) => {
    const phoneBox = document.querySelector<HTMLInputElement>("#wyhMobile")
    const vinBox = document.querySelector<HTMLInputElement>("#vinNumber")
    const radioBtn = document.querySelector<HTMLInputElement>("#polygon")
    const _verifyBtn = "#newDistribution > div.form-row > div > button:nth-child(1)"
    const verifyBtn = document.querySelector<HTMLButtonElement>(_verifyBtn);
    if (phoneBox && vinBox && radioBtn && verifyBtn) {
      phoneBox.value = details["phoneno"];
      phoneBox.dispatchEvent(new Event('change', { bubbles: true }));
      vinBox.value = details["vinno"];
      vinBox.dispatchEvent(new Event('change', { bubbles: true }));
      radioBtn.click();
      verifyBtn.scrollIntoView();
      verifyBtn.click();
    }
  }
  const handleFullForm = (details: Invoice) => {
    const phoneBox = document.querySelector<HTMLInputElement>("#Prefered\\ Mobile\\ Number");
    const addressLine1 = document.querySelector<HTMLInputElement>("#address1");
    const addressLine2 = document.querySelector<HTMLInputElement>("#Address\\ Line\\ 2");
    const streetName = document.querySelector<HTMLInputElement>("#Street\\ Name");
    const districtBox = document.querySelector<HTMLInputElement>("#District");
    const stateBox = document.querySelector<HTMLSelectElement>("#stateAdd");
    const pincodeBox = document.querySelector<HTMLInputElement>("#Pincode");
    if (phoneBox && addressLine1 && addressLine2 && streetName && districtBox && stateBox && pincodeBox) {
      phoneBox.value = details["phoneno"];
      phoneBox.dispatchEvent(new Event('change', { bubbles: true }));
      addressLine1.value = details["addressLine1"];
      addressLine1.dispatchEvent(new Event('change', { bubbles: true }));
      addressLine2.value = details["addressLine2"];
      addressLine2.dispatchEvent(new Event('change', { bubbles: true }));
      streetName.value = details["streetName"];
      streetName.dispatchEvent(new Event('change', { bubbles: true }));
      districtBox.value = details["district"];
      districtBox.dispatchEvent(new Event('change', { bubbles: true }));
      stateBox.value = details["state"];
      stateBox.dispatchEvent(new Event('change', { bubbles: true }));
      pincodeBox.value = details["pincode"];
      pincodeBox.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  const onClickBtn = async (type: ButtonType) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: type == "SHALLOW" ? handleShallowForm : handleFullForm,
        args: [details]
      })
    }
  }
  const actionBtns: Array<ActionBtn> = [
    {
      title: "FORM 1",
      color: "bg-rose-500",
      onClick: () => {onClickBtn('SHALLOW')}
    },
    {
      title: "FORM 2",
      color: "bg-emerald-500",
      onClick: () => {onClickBtn('SHALLOW')}
    },
    {
      title: "CLEAR",
      color: "bg-slate-500",
      onClick: () => {
        chrome.storage.session.remove("shadow-invoice");
        setDetails(undefined);
      }
    },
  ]
  return (
    <div className="w-full flex justify-center mt-2">
      {actionBtns.map(option => <button onClick={option.onClick} key={option.title}
        className={`py-2 shadow-lg ${option.color} opacity-70 cursor-pointer text-green-100 font-mono mr-2 px-2 h-min text-nowrap`}>
        {option.title}
      </button>)}
    </div>
  )
}

export default function App() {
  const { token, setToken } = useToken()
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<Invoice | undefined>()
  const [exception, setException] = useState<string | undefined>()
  const connectToBackend = async () => {
    if (!token) return null;
    // Get list of invoices.
    const listRequest = await fetch(`https://api.mahindradealerrise.com/otf/vehicleinvoice/search?searchType=invoiceNumber&searchParam=${search}&pageNumber=1&pageSize=10&invoiceStatus=I&sortBy=modelDescription&sortIn=DESC`, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accesstoken": token.accesstoken,
        "authorization": token.authorization,
        "userid": token.userid
      }
    })
    // Check for unauthorization.
    if (listRequest.status == 401) {
      setToken(null);
      return;
    }
    const listResponse = await listRequest.json()
    if (!listRequest.ok) {
      const exception = {
        invoice: search,
        tokens: token,
        response: listResponse
      }
      setException(JSON.stringify(exception))
      return;
    }
    // Get full data of the invoice.
    const firstInvoice = listResponse["data"]["paginationData"][0]
    const { id: invoiceId, otfNumber } = firstInvoice
    const request = await fetch(`https://api.mahindradealerrise.com/otf/vehicleinvoice/details?invoiceId=${invoiceId}&otfNumber=${otfNumber}`, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accesstoken": token.accesstoken,
        "authorization": token.authorization,
        "userid": token.userid
      }
    })
    const response = await request.json()
    const cupcakes = response["data"]["invoiceDetails"]["bookingAndBillingCustomerDto"]["bookingCustomer"]
    const vanilla = response["data"]["vehicleDetails"]
    const unstructuredAddress = cupcakes["address1"]
    const chocolate: Invoice = {
      invoice: response["data"]["invoiceDetails"]["invoiceNumber"],
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
    setDetails(chocolate)
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
      if (response && response["shadow-invoice"]) setDetails(JSON.parse(response["shadow-invoice"]))
    })
  }, [])
  return (
    <div className="shadow-xl p-4 max-w-md">
      <Logo/>
      <form onSubmit={handleSearch} className={`flex flex-row w-full justify-center ${details || "pb-28"}`}>
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
      {details && <div className="mt-2">
        <div className="backdrop-brightness-60 backdrop-contrast-125 font-mono border-1 border-stone-400 rounded-md p-2">
          <p className="font-bold text-lime-50">{details["invoice"]}</p>
          <hr className="text-stone-400 mb-1"/>
          <table className="text-lime-50">
            <tbody>
              {(Object.entries(details) as [keyof Invoice, Invoice[keyof Invoice]][]).map(
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
        <Actions details={details} setDetails={setDetails}/>
      </div>}
      {exception && <div className="text-sm font-mono mt-3 p-3 flex flex-row text-red-500 font-bold bg-red-100 border-1 rounded-md">
        <Info className="mr-1 size-4"/>
        {exception}
      </div>}
    </div>
  )
}
