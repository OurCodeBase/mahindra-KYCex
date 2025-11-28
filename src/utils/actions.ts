import type { Vehicle } from '@/types';
import { PDFLib } from './pdflib';

export function fillFirstform(vehicle: Vehicle) {
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

export function fillSecondform(vehicle: Vehicle) {
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

export async function sendPdfDocument(vehicle: Vehicle) {
  const pdflib = new PDFLib(vehicle);
  await pdflib.initialise()
  await pdflib.createPdf()
}
