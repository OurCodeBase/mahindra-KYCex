import type { Vehicle } from '@/types';
import type { Token } from '@/hooks/token';
import { extractAddress } from '@/utils/genai';

export class Searchconsole {
  token: Token;
  invoiceno: string;
  constructor(token: Token, invoiceno: string) {
    this.token = token;
    this.invoiceno = invoiceno;
  }
  private async getOtfNumberAndInvoiceid() {
    const request = await fetch("https://api.mahindradealerrise.com/otf/vehicleinvoice/search?searchType=invoiceNumber&searchParam=" + this.invoiceno + "&pageNumber=1&pageSize=10&invoiceStatus=I&sortBy=modelDescription&sortIn=DESC", {
      headers: {
        accept: "application/json, text/plain, */*",
        ...this.token,
      }
    })
    const error = new Error("Oops! You have to login into robin portal again.");
    error.name = "AUTHORIZATION-REVOKED";
    if (request.status == 401) throw error;
    const response = await request.json()
    if (response["data"]["paginationData"].length == 0)
      throw Error("Cannot find a vehicle with this invoice number.");
    const firstInvoice = response["data"]["paginationData"][0]
    const { id: invoiceId, otfNumber } = firstInvoice;
    return { invoiceId, otfNumber };
  }
  public async getVehicledata() {
    const { invoiceId, otfNumber } = await this.getOtfNumberAndInvoiceid()
    const request = await fetch(`https://api.mahindradealerrise.com/otf/vehicleinvoice/details?invoiceId=${invoiceId}&otfNumber=${otfNumber}`, {
      headers: {
        accept: "application/json, text/plain, */*",
        ...this.token,
      }
    })
    const response = await request.json()
    const customerInfo = response["data"]["invoiceDetails"]["bookingAndBillingCustomerDto"]["bookingCustomer"]
    const vehicleInfo = response["data"]["vehicleDetails"]
    const fullAddress = customerInfo["address1"] + customerInfo["address2"] + customerInfo["address3"]
    const { streetName, addressLine1, addressLine2 } = await extractAddress(fullAddress);
    const fields: Vehicle = {
      model: vehicleInfo["model"],
      invoice: response["data"]["invoiceDetails"]["invoiceNumber"],
      name: customerInfo["customerName"],
      streetName: streetName,
      addressLine1: addressLine1,
      addressLine2: addressLine2,
      district: customerInfo["district"],
      state: customerInfo["state"],
      pincode: customerInfo["pincode"],
      phoneno: customerInfo["mobileNumber"],
      email: customerInfo["email"],
      vinno: vehicleInfo["vinNumber"],
    }
    return fields;
  }
}
