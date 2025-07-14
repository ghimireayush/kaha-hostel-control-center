import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
}

export class PDFService {
  private static instance: PDFService;

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  // Export HTML element to PDF
  async exportElementToPDF(element: HTMLElement, options: PDFExportOptions): Promise<void> {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      // Add header
      pdf.setFontSize(20);
      pdf.text(options.title, pdfWidth / 2, 20, { align: 'center' });
      
      if (options.subtitle) {
        pdf.setFontSize(12);
        pdf.text(options.subtitle, pdfWidth / 2, 30, { align: 'center' });
      }

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(options.filename);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to export PDF');
    }
  }

  // Generate student invoice PDF
  async generateInvoicePDF(student: any, invoice: any): Promise<void> {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text('Kaha Hostel', 20, 20);
    pdf.setFontSize(14);
    pdf.text('Invoice', 20, 35);
    
    // Student details
    pdf.setFontSize(12);
    pdf.text(`Student: ${student.name}`, 20, 50);
    pdf.text(`Room: ${student.roomNumber}`, 20, 60);
    pdf.text(`Month: ${invoice.month}`, 20, 70);
    pdf.text(`Due Date: ${invoice.dueDate}`, 20, 80);
    
    // Fee breakdown
    pdf.text('Fee Breakdown:', 20, 100);
    pdf.text(`Base Monthly Fee: NPR ${student.baseMonthlyFee}`, 30, 110);
    pdf.text(`Laundry Fee: NPR ${student.laundryFee}`, 30, 120);
    pdf.text(`Food Fee: NPR ${student.foodFee}`, 30, 130);
    
    pdf.setFontSize(14);
    pdf.text(`Total: NPR ${invoice.total}`, 20, 150);
    pdf.text(`Status: ${invoice.status}`, 20, 160);
    
    pdf.save(`invoice-${student.name}-${invoice.month}.pdf`);
  }

  // Generate student ledger PDF
  async generateLedgerPDF(student: any, transactions: any[]): Promise<void> {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text('Kaha Hostel - Student Ledger', 20, 20);
    
    // Student info
    pdf.setFontSize(12);
    pdf.text(`Student: ${student.name}`, 20, 40);
    pdf.text(`Room: ${student.roomNumber}`, 20, 50);
    pdf.text(`Current Balance: NPR ${student.currentBalance}`, 20, 60);
    
    // Transactions
    pdf.text('Transaction History:', 20, 80);
    let yPosition = 90;
    
    transactions.forEach((transaction, index) => {
      if (yPosition > 270) { // New page if needed
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(
        `${transaction.date} - ${transaction.type}: NPR ${transaction.amount}`,
        30,
        yPosition
      );
      yPosition += 10;
    });
    
    pdf.save(`ledger-${student.name}.pdf`);
  }
}

export const pdfService = PDFService.getInstance();