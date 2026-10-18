import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { ZDoc } from "@/lib/documents";
import { docToText } from "@/lib/documents";

export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string = "document",
): Promise<void> {
  const cleanName = filename.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim() || "document";

  // Create canvas from element with 2x scale for crisp print quality
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL("image/png");

  // Standard A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 10;
  const contentWidth = pdfWidth - margin * 2;
  const contentHeight = (canvas.height * contentWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let heightLeft = contentHeight;
  let position = margin;

  // First page
  pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight);
  heightLeft -= pdfHeight - margin * 2;

  // Add subsequent pages if document is longer than one A4 page
  while (heightLeft > 0) {
    position = heightLeft - contentHeight + margin;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight);
    heightLeft -= pdfHeight - margin * 2;
  }

  pdf.save(`${cleanName}.pdf`);
}

export function downloadDocAsTextPdf(
  docOrText: ZDoc | string,
  filename: string = "document",
): void {
  const cleanName = filename.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim() || "document";
  const text = typeof docOrText === "string" ? docOrText : docToText(docOrText);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 20;
  const pageWidth = 210;
  const maxLineWidth = pageWidth - margin * 2;

  pdf.setFont("times", "normal");
  pdf.setFontSize(11);

  const lines = pdf.splitTextToSize(text, maxLineWidth);
  let y = margin;
  const lineHeight = 6.5;

  for (let i = 0; i < lines.length; i++) {
    if (y + lineHeight > 297 - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(lines[i], margin, y);
    y += lineHeight;
  }

  pdf.save(`${cleanName}.pdf`);
}
