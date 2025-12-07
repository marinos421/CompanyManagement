import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Transaction } from "../services/Finance/transaction.service";


// --- 1. EXPORT TO CSV ---
export const exportToCSV = (transactions: Transaction[], filename = "transactions.csv") => {
  // Ορισμός κεφαλίδων
  const headers = ["ID", "Date", "Type", "Category", "Description", "Amount", "Status"];

  // Μετατροπή δεδομένων σε γραμμές CSV
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type,
    t.category,
    `"${t.description || ""}"`, // Βάζουμε "" για να μην σπάει αν έχει κόμματα
    t.amount,
    t.status,
  ]);

  // Ένωση όλων σε ένα string
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Δημιουργία αρχείου και κατέβασμα
  // Το \uFEFF είναι για να αναγνωρίζει τα Ελληνικά το Excel
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- 2. EXPORT TO PDF ---
export const exportToPDF = (transactions: Transaction[], companyName: string = "EconomIT") => {
  const doc = new jsPDF();

  // Τίτλος
  doc.setFontSize(18);
  doc.text(`${companyName} - Transaction Report`, 14, 22);
  
  // Ημερομηνία Εκτύπωσης
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Πίνακας
  const tableColumn = ["Date", "Type", "Category", "Description", "Amount", "Status"];
  const tableRows: any[] = [];

  transactions.forEach((t) => {
    const transactionData = [
      t.date,
      t.type,
      t.category,
      t.description || "-",
      `${t.amount} €`, // Προσθήκη ευρώ
      t.status,
    ];
    tableRows.push(transactionData);
  });

  // @ts-ignore (γιατί το autotable μερικές φορές γκρινιάζει στα types)
  autoTable(doc, {
    startY: 40,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }, // Το μπλε του EconomIT
    styles: { fontSize: 9 },
  });

  doc.save("transactions_report.pdf");
};