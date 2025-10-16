// src/components/Settings/ImportSection.jsx
import React, { useRef } from 'react';
import { toast } from 'react-toastify';
import { useImportPerfumesMutation } from '../../api';
import { deserializeComplexData } from '../../utils/helperCsv';

const ImportSection = ({ importing, setImporting }) => {
  const fileInputRef = useRef(null);
  const [importPerfumes] = useImportPerfumesMutation();

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        setImporting(true);
        const text = e.target.result;

        const cleanText = text.replace(/^\uFEFF/, '');
        const lines = cleanText.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          toast.error('CSV file is empty or invalid');
          setImporting(false);
          return;
        }

        const dataLines = lines.slice(1);

        const parsedPerfumes = dataLines.map((line, index) => {
          try {
            const values = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];

              if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                  current += '"';
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());

            return {
              name: values[0] || '',
              brand: values[1] || '',
              concentration: values[2] || '',
              description: values[3] || '',
              year: values[4] ? parseInt(values[4]) : null,
              intendedFor: deserializeComplexData(values[5]),
              seasons: deserializeComplexData(values[6]),
              occasions: deserializeComplexData(values[7]),
              occasionVotes: {
                day: values[8] ? parseInt(values[8]) : 0,
                night: values[9] ? parseInt(values[9]) : 0
              },
              mainAccords: deserializeComplexData(values[10]),
              perfumers: deserializeComplexData(values[11]),
              notes: {
                top: deserializeComplexData(values[12]),
                middle: deserializeComplexData(values[13]),
                base: deserializeComplexData(values[14]),
                notes: deserializeComplexData(values[15])
              }
            };
          } catch (error) {
            console.error(`Error parsing line ${index + 2}:`, error);
            return null;
          }
        }).filter(Boolean);

        if (parsedPerfumes.length === 0) {
          toast.error('No valid perfumes found in CSV');
          setImporting(false);
          return;
        }

        const response = await importPerfumes({ perfumes: parsedPerfumes }).unwrap();

        toast.success(`Successfully imported ${response.imported} perfumes!`);

        if (response.failed > 0) {
          toast.warning(`${response.failed} perfumes failed to import.`);
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error(error?.data?.message || 'Failed to import perfumes');
      } finally {
        setImporting(false);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
      setImporting(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-[#352AA4]/10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Import Perfumes</h3>
              <p className="text-sm text-gray-600">Upload CSV file to import perfumes</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Import perfumes from CSV file. The system will process data in batches automatically.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {importing ? 'Importing...' : 'Import from CSV'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default ImportSection;
