'use client';

import { useState } from 'react';
import { Button } from './ui/Button';

interface CSVViewModalProps {
  isOpen: boolean;
  csv: string;
  onClose: () => void;
}

export function CSVViewModal({ isOpen, csv, onClose }: CSVViewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    return lines.map(line => 
      line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
    );
  };

  const csvData = csv ? parseCSV(csv) : [];
  const headers = csvData[0] || [];
  const rows = csvData.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-gray-900 border-2 border-yellow-400 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b-2 border-yellow-400">
          <h2 className="text-2xl font-bold text-yellow-400">CSV Data Table</h2>
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="secondary" className="text-sm">
              {copied ? '✓ Copied!' : '📋 Copy CSV'}
            </Button>
            <Button onClick={onClose} variant="ghost" className="text-yellow-400">
              ✕ Close
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          {csvData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-yellow-400/20">
                    {headers.map((header, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left text-sm font-semibold text-yellow-400 border-2 border-yellow-400"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? 'bg-black/40' : 'bg-black/20'}
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-sm text-white/80 border border-yellow-400/30"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-yellow-400/70 text-lg">No CSV data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
