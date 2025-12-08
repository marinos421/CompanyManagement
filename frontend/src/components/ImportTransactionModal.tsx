import React, { useState } from "react";
import Papa from "papaparse";
import Modal from "./Modal";
import Button from "./Button";
import Select from "./Select";
import TransactionService, { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../services/Finance/transaction.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SYSTEM_FIELDS = [
  { key: "date", label: "Date (YYYY-MM-DD)", required: true },
  { key: "amount", label: "Amount", required: true },
  { key: "description", label: "Description", required: false },
  { key: "category", label: "Category", required: true },
  { key: "type", label: "Type (INCOME/EXPENSE)", required: true },
];

const ImportTransactionsModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Preview/Submit
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // STEP 1: Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvHeaders(results.meta.fields || []);
        setCsvData(results.data);
        setStep(2); // Go to mapping step
      },
    });
  };

  // STEP 2: Handle Column Mapping
  const handleMappingChange = (systemField: string, csvHeader: string) => {
    setMapping((prev) => ({ ...prev, [systemField]: csvHeader }));
  };

  // STEP 3: Process & Submit
  const handleImport = async () => {
    setLoading(true);
    try {
      const transactionsToImport: Transaction[] = csvData.map((row) => {
        // Find mapped values
        const typeRaw = row[mapping["type"]]?.toUpperCase();
        
        // Basic Validations / Defaults
        let category = row[mapping["category"]];
        if (![...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].includes(category)) {
            category = "OTHER"; // Fallback if category doesn't match ours
        }

        return {
          date: row[mapping["date"]], // Assuming User puts YYYY-MM-DD
          amount: parseFloat(row[mapping["amount"]]),
          description: row[mapping["description"]] || "",
          type: typeRaw === "INCOME" ? "INCOME" : "EXPENSE",
          category: category,
          status: "COMPLETED" // Default for imports
        };
      });

      // Filter out invalid rows (e.g. missing amount)
      const validTransactions = transactionsToImport.filter(t => t.date && !isNaN(t.amount));

      await TransactionService.createBatch(validTransactions);
      onSuccess();
      onClose();
      // Reset
      setStep(1);
      setMapping({});
    } catch (error) {
      alert("Import failed. Please check your data format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Transactions (CSV)">
      
      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div className="space-y-4 text-center">
          <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 bg-slate-900">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="text-white" />
            <p className="text-slate-400 text-sm mt-2">Upload a CSV file</p>
          </div>
          <div className="text-left bg-blue-900/20 p-4 rounded text-xs text-blue-300">
            <p><strong>Tip:</strong> Your CSV should minimally have columns for Date, Amount, and Type.</p>
          </div>
        </div>
      )}

      {/* STEP 2: MAP COLUMNS */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Match your CSV columns to our system fields:</p>
          
          <div className="space-y-3">
            {SYSTEM_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-700">
                <span className="text-white text-sm font-bold w-1/3">
                    {field.label} {field.required && "*"}
                </span>
                <span className="text-slate-500">?</span>
                <div className="w-1/2">
                    <Select 
                        options={[
                            { value: "", label: "-- Select Column --" }, 
                            ...csvHeaders.map(h => ({ value: h, label: h }))
                        ]}
                        value={mapping[field.key] || ""}
                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                        className="py-1 text-sm"
                    />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={handleImport} isLoading={loading}>Import {csvData.length} Rows</Button>
          </div>
        </div>
      )}

    </Modal>
  );
};

export default ImportTransactionsModal;