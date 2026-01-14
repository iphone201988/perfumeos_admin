// src/components/Settings/PerfumeExportImport.jsx
import React, { useState, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useGetPerfumeStatsQuery, useExportPerfumesBatchMutation, useImportPerfumesMutation } from '../../api';
import LoadingOverlay from './LoadingOverlay';
import BatchSizeSelector from './BatchSizeSelector';
import BatchSelectorModal from './BatchSelectorModal';
import { escapeCSV, serializeComplexData, deserializeComplexData, parseCSV } from '../../utils/helperCsv';

const PerfumeExportImport = () => {
  const [batchSize, setBatchSize] = useState(2000);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [showBatchSelector, setShowBatchSelector] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);

  const { data: statsData } = useGetPerfumeStatsQuery();
  const [exportPerfumesBatch] = useExportPerfumesBatchMutation();
  const [importPerfumes] = useImportPerfumesMutation();

  const totalPerfumes = statsData?.data?.total || 0;
  const totalBatches = useMemo(() => Math.ceil(totalPerfumes / batchSize), [totalPerfumes, batchSize]);

  // CSV Headers for Perfumes
  const csvHeaders = [
    'Name', 'Brand', 'Brand Id', 'Image', 'Concentration', 'Description', 'Year',
    'Intended For', 'Main Accords', 'Perfumers',
    'Top Notes', 'Middle Notes', 'Base Notes', 'Other Notes', 'Created At', '_id', 'Images'
  ];

  // Format perfume data for CSV row
  const formatPerfumeRow = (perfume) => [
    escapeCSV(perfume.name),
    escapeCSV(perfume.brand),
    escapeCSV(perfume.brandId),
    escapeCSV(perfume.image),
    escapeCSV(perfume.concentration),
    escapeCSV(perfume.description),
    escapeCSV(perfume.year),
    escapeCSV(serializeComplexData(perfume.intendedFor)),
    escapeCSV(serializeComplexData(perfume.mainAccords)),
    escapeCSV(serializeComplexData(perfume.perfumers)),
    escapeCSV(serializeComplexData(perfume.notes?.top)),
    escapeCSV(serializeComplexData(perfume.notes?.middle)),
    escapeCSV(serializeComplexData(perfume.notes?.base)),
    escapeCSV(serializeComplexData(perfume.notes?.notes)),
    escapeCSV(perfume.createdAt),
    escapeCSV(perfume._id),
    escapeCSV(serializeComplexData(perfume.images))
  ];

  // Export single CSV file with all perfumes
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const totalBatchesCalc = Math.ceil(totalPerfumes / batchSize);

      if (totalBatchesCalc === 0) {
        toast.warning('No perfumes to export');
        setExporting(false);
        return;
      }

      let csvRows = [csvHeaders.join(',')];

      // Fetch and process each batch
      for (let batch = 1; batch <= totalBatchesCalc; batch++) {
        setExportProgress({ current: batch, total: totalBatchesCalc });

        const response = await exportPerfumesBatch({
          page: batch,
          limit: batchSize
        }).unwrap();

        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(perfume => {
            csvRows.push(formatPerfumeRow(perfume).join(','));
          });
        }

        if (batch < totalBatchesCalc) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Create and download CSV
      const csvContent = '\uFEFF' + csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `perfumes_export_${new Date().toISOString().split('T')[0]}_${csvRows.length - 1}_items.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${csvRows.length - 1} perfumes!`);
      setExportProgress({ current: 0, total: 0 });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error?.data?.message || 'Failed to export perfumes');
      setExportProgress({ current: 0, total: 0 });
    } finally {
      setExporting(false);
    }
  };

  // Export multiple CSV files (one per batch)
  const handleExportMultipleCSV = async () => {
    try {
      setExporting(true);
      const totalBatchesCalc = Math.ceil(totalPerfumes / batchSize);

      if (totalBatchesCalc === 0) {
        toast.warning('No perfumes to export');
        setExporting(false);
        return;
      }

      let exportedCount = 0;

      // Export each batch as separate file
      for (let batch = 1; batch <= totalBatchesCalc; batch++) {
        setExportProgress({ current: batch, total: totalBatchesCalc });

        const response = await exportPerfumesBatch({
          page: batch,
          limit: batchSize
        }).unwrap();

        if (response.data && Array.isArray(response.data)) {
          let csvRows = [csvHeaders.join(',')];

          response.data.forEach(perfume => {
            csvRows.push(formatPerfumeRow(perfume).join(','));
          });

          // Create file for this batch
          const csvContent = '\uFEFF' + csvRows.join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = url;
          link.download = `perfumes_batch_${batch}_of_${totalBatchesCalc}_${response.data.length}_items.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          exportedCount += response.data.length;
        }

        // Delay between downloads
        if (batch < totalBatchesCalc) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast.success(`Successfully exported ${exportedCount} perfumes in ${totalBatchesCalc} files!`);
      setExportProgress({ current: 0, total: 0 });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error?.data?.message || 'Failed to export perfumes');
      setExportProgress({ current: 0, total: 0 });
    } finally {
      setExporting(false);
    }
  };

  // Import perfumes from CSV
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

        // Remove BOM if present
        const rows = parseCSV(text);

        if (rows.length < 2) {
          toast.error('CSV file is empty or invalid');
          setImporting(false);
          return;
        }

        const dataRows = rows.slice(1);

        const parsedPerfumes = dataRows.map((values, index) => {
          try {
            // Trim values and check for at least a name
            const trimmedValues = values.map(v => (v || '').trim());
            if (!trimmedValues[0]) return null;

            return {
              name: trimmedValues[0],
              brand: trimmedValues[1] || '',
              brandId: trimmedValues[2] || '',
              image: trimmedValues[3] || '',
              concentration: trimmedValues[4] || '',
              description: trimmedValues[5] || '',
              year: trimmedValues[6] ? parseInt(trimmedValues[6]) : null,
              intendedFor: deserializeComplexData(trimmedValues[7]),
              mainAccords: deserializeComplexData(trimmedValues[8]),
              perfumers: deserializeComplexData(trimmedValues[9]),
              notes: {
                top: deserializeComplexData(trimmedValues[10]),
                middle: deserializeComplexData(trimmedValues[11]),
                base: deserializeComplexData(trimmedValues[12]),
                notes: deserializeComplexData(trimmedValues[13])
              },
              createdAt: trimmedValues[14],
              _id: trimmedValues[15],
              images: deserializeComplexData(trimmedValues[16]) || []
            };
          } catch (error) {
            console.error(`Error parsing row ${index + 2}:`, error);
            return null;
          }
        }).filter(Boolean);

        if (parsedPerfumes.length === 0) {
          toast.error('No valid perfumes found in CSV');
          setImporting(false);
          return;
        }

        // Send to backend
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

  // Download sample CSV template
  const handleDownloadSampleCSV = () => {
    const sampleData = [
      [
        'Bleu de Chanel',
        'Chanel',
        '132165465746879879879',
        'https://example.png',
        'Eau de Parfum',
        'A woody aromatic fragrance with citrus notes and a sophisticated blend of incense and cedar.',
        '2010',
        'men',
        '{"name":"woody","width":"80%","backgroundColor":"rgb(139, 69, 19)"}|{"name":"citrus","width":"70%","backgroundColor":"rgb(255, 165, 0)"}|{"name":"aromatic","width":"60%","backgroundColor":"rgb(46, 139, 87)"}',
        '{"name":"Jacques Polge"}',
        '{"name":"Lemon"}|{"name":"Bergamot"}|{"name":"Pink Pepper"}',
        '{"name":"Ginger"}|{"name":"Nutmeg"}|{"name":"Jasmine"}',
        '{"name":"Incense"}|{"name":"Cedar"}|{"name":"Sandalwood"}',
        '',
        new Date().toISOString(),
        '12312324124124124124',
      ],
      [
        'La Vie Est Belle',
        'Lancôme',
        '12312324124124124124',
        'https://example.png',
        'Eau de Parfum',
        'A sweet floral gourmand fragrance with iris, patchouli, and praline.',
        '2012',
        'women',
        '{"name":"sweet","width":"90%","backgroundColor":"rgb(255, 182, 193)"}|{"name":"floral","width":"85%","backgroundColor":"rgb(255, 192, 203)"}|{"name":"gourmand","width":"75%","backgroundColor":"rgb(210, 180, 140)"}',
        '{"name":"Olivier Polge"}|{"name":"Dominique Ropion"}',
        '{"name":"Blackcurrant"}|{"name":"Pear"}',
        '{"name":"Iris"}|{"name":"Jasmine"}|{"name":"Orange Blossom"}',
        '{"name":"Praline"}|{"name":"Vanilla"}|{"name":"Patchouli"}',
        '',
        new Date().toISOString(),
        '1232132341242334',
      ]
    ];

    const csvRows = [csvHeaders.join(',')];
    sampleData.forEach(row => {
      csvRows.push(row.map(cell => escapeCSV(cell)).join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'perfumes_sample_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Sample CSV template downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={importing || exporting}
        importing={importing}
        exportProgress={exportProgress}
      />

      {/* Batch Selector Modal */}
      <BatchSelectorModal
        isOpen={showBatchSelector}
        onClose={() => {
          setShowBatchSelector(false);
          setSelectedBatches([]);
        }}
        batchSize={batchSize}
        totalItems={totalPerfumes}
        selectedBatches={selectedBatches}
        setSelectedBatches={setSelectedBatches}
        setExporting={setExporting}
        setExportProgress={setExportProgress}
        exportBatchMutation={exportPerfumesBatch}
        dataType="perfumes"
        headers={csvHeaders}
        formatRowData={formatPerfumeRow}
      />

      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
        <h2 className="text-[20px] font-bold text-[#352AA4]">Perfume Data Management</h2>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">CSV Format Information</h3>
            <p className="text-sm text-blue-700">
              Exports are processed in batches for optimal performance. Complex data (arrays, objects) uses pipe (|) as delimiter. Compatible with Excel and Google Sheets.
            </p>
          </div>
        </div>
      </div>

      {/* Batch Size Selector */}
      <BatchSizeSelector
        batchSize={batchSize}
        setBatchSize={setBatchSize}
        totalItems={totalPerfumes}
        setSelectedBatches={setSelectedBatches}
        itemName="perfumes"
      />

      {/* Export Section */}
      <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-[#352AA4]/10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Export All Perfumes</h3>
                <p className="text-sm text-gray-600">Download as CSV file(s)</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Export all perfumes with complete data in CSV format. Processed in batches of {batchSize.toLocaleString()} items.
            </p>
            <div className="flex gap-3 flex-wrap">
              {/* <button
                onClick={handleExportCSV}
                disabled={exporting || totalPerfumes === 0}
                className="bg-green-600 text-white px-6 py-2.5 rounded-full hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {exporting ? 'Exporting...' : 'Export Single CSV'}
              </button>

              <button
                onClick={handleExportMultipleCSV}
                disabled={exporting || totalPerfumes === 0}
                className="bg-teal-600 text-white px-6 py-2.5 rounded-full hover:bg-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                Export Multiple CSVs
              </button> */}

              <button
                onClick={() => setShowBatchSelector(true)}
                disabled={exporting || totalPerfumes === 0}
                className="bg-purple-600 text-white px-6 py-2.5 rounded-full hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Select Specific Batches
              </button>
            </div>
            {totalBatches > 1 && (
              <p className="text-xs text-gray-500 mt-3">
                💡 With {totalPerfumes.toLocaleString()} perfumes and batch size {batchSize.toLocaleString()},
                this will create {totalBatches} CSV file(s)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Import Section */}
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

      {/* Sample Template Section */}
      <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-purple-200">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Sample CSV Template</h3>
                <p className="text-sm text-gray-600">Download example format</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Download a sample CSV file with 2 example perfumes to understand the correct data structure.
            </p>
            <button
              onClick={handleDownloadSampleCSV}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-full hover:bg-purple-700 transition-all duration-300 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Sample CSV
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-3">How to Use:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-4">
          <li><strong>Select Batch Size:</strong> Choose records per batch (1000, 2000, 5000, or 10000)</li>
          <li><strong>Export Options:</strong>
            <ul className="list-disc list-inside ml-6 mt-1">
              {/* <li>Single CSV: All perfumes in one file</li>
              <li>Multiple CSVs: Each batch as separate file</li> */}
              <li>Select Specific Batches: Choose only needed batches</li>
            </ul>
          </li>
          <li><strong>Import:</strong> Upload CSV files to import perfumes in bulk</li>
        </ol>

        <h3 className="font-bold text-gray-800 mb-3 mt-4">CSV Format Rules:</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>Multiple values separated by pipe (|) character</li>
          <li>Complex objects use JSON format separated by pipes</li>
          <li>UTF-8 encoding with BOM for Excel compatibility</li>
          <li>Example: <code className="bg-gray-200 px-2 py-1 rounded text-xs">{'{"name":"Jacques Polge"}|{"name":"Olivier Polge"}'}</code></li>
        </ul>
      </div>
    </div>
  );
};

export default PerfumeExportImport;
