import fontkit from "@pdf-lib/fontkit";
import * as pdfjsLib from "pdfjs-dist";
import { degrees, PDFDocument, PDFFont, rgb } from "pdf-lib";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import type { Vehicle } from "@/types";
import type { Color, PDFPage } from 'pdf-lib';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type FontCast = 'font' | 'signature';
type FieldItem = {
  key: keyof Vehicle,
  x: number,
  y: number
};
type Fields = Array<FieldItem>;

export class PDFLib {
  private font!: PDFFont;
  private fontName!: string;
  private signature!: PDFFont;
  private signatureName!: string;
  private vehicle: Vehicle;
  private pdfPage!: PDFPage;
  private pdfDocument!: PDFDocument;
  private color: Color = rgb(0, 0.32, 0.72);
  constructor(vehicle: Vehicle) {
    this.vehicle = vehicle;
  }
  private getRandomItem(arr: Array<string>) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }
  private getSpacedString(str: string, padding = 2) {
    const space = ' '.repeat(padding);
    return str.split('').join(space);
  }
  public async initialise() {
    const request = await fetch("/document.pdf");
    const response = await request.arrayBuffer();
    const fonts = ['QEBradenHill', 'QEDavidReid', 'QECarolineMutiboko', 'QEHerbertCooper'];
    const signatures = ['AngeliaBirthday', 'AsemKandis', 'HealingFairySignature', 'WestburySignature'];
    const pdfDocument = await PDFDocument.load(response);
    pdfDocument.registerFontkit(fontkit);
    this.pdfDocument = pdfDocument;
    this.font = await this.getPDFFont(this.getRandomItem(fonts), 'font');
    this.signature = await this.getPDFFont(this.getRandomItem(signatures), 'signature');
    this.pdfPage = pdfDocument.getPages()[0];
  }
  private async getPDFFont(name: string, cast: FontCast) {
    if (cast == 'font') this.fontName = name;
    else this.signatureName = name;
    const request = await fetch(`/${cast}s/${name}.${cast == 'font' ? 'ttf' : 'otf'}`);
    const response = await request.arrayBuffer();
    const font = this.pdfDocument.embedFont(response);
    return font;
  }
  private setText(data: string, font: PDFFont, x_coordinate: number, y_coordinate: number, size = 16) {
    this.pdfPage.drawText(data, {
      x: x_coordinate,
      y: y_coordinate,
      size: size,
      font: font,
      color: this.color
    })
  }
  private fillCommonInfo() {
    const fields: Fields = [
      { key: 'model', x: 238, y: 758 },
      { key: 'invoice', x: 261, y: 739 },
      { key: 'name', x: 260, y: 720 },
      { key: 'streetName', x: 333, y: 666 },
      { key: 'addressLine1', x: 333, y: 646 },
      { key: 'addressLine2', x: 333, y: 627 },
      { key: 'district', x: 335, y: 608 },
      { key: 'state', x: 385, y: 590 },
      { key: 'pincode', x: 357, y: 571 },
      { key: 'email', x: 267, y: 429 },
      { key: 'vinno', x: 267, y: 411 },
      { key: 'name', x: 246, y: 159 },
    ]
    fields.forEach(({ key, x, y }) => {
      this.setText(this.vehicle[key], this.font, x, y)
    })
  }
  private fillContactInfo() {
    const fields: Fields = [
      { key: 'phoneno', x: 264, y: 526 },
      { key: 'phoneno', x: 264, y: 485 }
    ]
    const sizes: Record<string, number> = {
      'QEBradenHill': 13,
      'QEHerbertCooper': 17
    }
    fields.forEach(({ key, x, y }) => {
      const s = this.vehicle[key];
      const d = this.getSpacedString(s);
      this.setText(d, this.font, x, y, sizes[this.fontName]);
    })
  }
  private fillSignatureInfo() {
    const name: string = this.vehicle.name;
    const nameBuffer = name.split(' ');
    const edge = nameBuffer.slice(0, nameBuffer.length - 1).join(' ');
    const visibilites: Record<string, number> = {
      'AsemKandis': 0.75,
    }
    this.pdfPage.drawText(edge, {
      x: 80,
      y: 75,
      size: 30,
      font: this.signature,
      rotate: degrees(20),
      opacity: visibilites[this.signatureName] || 1,
      color: this.color
    })
  }
  private sendPdfDocument(uint8ArrayData: Uint8Array<ArrayBufferLike>, filename: string) {
    const uint8 = new Uint8Array(uint8ArrayData);
    const blob = new Blob([uint8], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  private async getPdfScreenshot(pdfBuffer: Uint8Array) {
    const pdfDocument = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    const page = await pdfDocument.getPage(1);
    const viewport = page.getViewport({ scale: 2.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext("2d") || undefined;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({
      canvas: canvas,
      canvasContext: context,
      viewport: viewport
    }).promise;
    const dataURL = canvas.toDataURL("image/png", 8);
    return dataURL;
  }
  private async getScreenshotToPdf(dataURL: string) {
    const base64 = dataURL.split(",")[1];
    const pdfDocument = await PDFDocument.create();
    const documentImage = await pdfDocument.embedPng(base64);
    const { width, height } = documentImage;
    const page = pdfDocument.addPage([width, height])
    page.drawImage(documentImage, {
      x: 0,
      y: 0,
      width,
      height
    })
    const pdfBytes = await pdfDocument.save();
    return pdfBytes;
  }
  public async createPdf() {
    this.fillCommonInfo();
    this.fillContactInfo();
    this.fillSignatureInfo();
    const pdfBuffer = await this.pdfDocument.save();
    const pdfScreenshot = await this.getPdfScreenshot(pdfBuffer);
    const pdfDocument = await this.getScreenshotToPdf(pdfScreenshot);
    this.sendPdfDocument(pdfDocument, this.vehicle.name.toLowerCase() + '.pdf')
  }
}
