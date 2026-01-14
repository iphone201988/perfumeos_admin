// src/components/Settings/NotesExportImport.jsx
import React, { useState, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useGetNotesStatsQuery, useExportNotesBatchMutation, useImportNotesMutation } from '../../api';
import LoadingOverlay from './LoadingOverlay';
import BatchSizeSelector from './BatchSizeSelector';
import BatchSelectorModal from './BatchSelectorModal';
import { deserializeComplexData, serializeComplexData, escapeCSV, parseCSV } from '../../utils/helperCsv';
const NotesExportImport = () => {
  const [batchSize, setBatchSize] = useState(2000);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [showBatchSelector, setShowBatchSelector] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);

  const { data: statsData } = useGetNotesStatsQuery();
  const [exportNotesBatch] = useExportNotesBatchMutation();
  const [importNotes] = useImportNotesMutation();

  const totalNotes = statsData?.data?.total || 0;
  const totalBatches = useMemo(() => Math.ceil(totalNotes / batchSize), [totalNotes, batchSize]);

  // Export single CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const totalBatchesCalc = Math.ceil(totalNotes / batchSize);

      if (totalBatchesCalc === 0) {
        toast.warning('No notes to export');
        setExporting(false);
        return;
      }

      const headers = [
        'Name', 'Image', 'Background URL', 'Group', 'Odor Profile',
        'Scientific Name', 'Other Names', 'Thumbnails', 'URL', 'Created At', '_id'
      ];

      let csvRows = [headers.join(',')];

      for (let batch = 1; batch <= totalBatchesCalc; batch++) {
        setExportProgress({ current: batch, total: totalBatchesCalc });

        const response = await exportNotesBatch({ page: batch, limit: batchSize }).unwrap();

        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(note => {
            const row = [
              escapeCSV(note.name),
              escapeCSV(note.image),
              escapeCSV(note.bgUrl),
              escapeCSV(note.group),
              escapeCSV(note.odorProfile),
              escapeCSV(note.scientificName),
              escapeCSV(serializeComplexData(note.otherNames)),
              escapeCSV(serializeComplexData(note.thumbnails)),
              escapeCSV(note.url),
              escapeCSV(note.createdAt),
              escapeCSV(note._id),
            ];
            csvRows.push(row.join(','));
          });
        }

        if (batch < totalBatchesCalc) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      const csvContent = '\uFEFF' + csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `notes_export_${new Date().toISOString().split('T')[0]}_${csvRows.length - 1}_items.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${csvRows.length - 1} notes!`);
      setExportProgress({ current: 0, total: 0 });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error?.data?.message || 'Failed to export notes');
      setExportProgress({ current: 0, total: 0 });
    } finally {
      setExporting(false);
    }
  };

  // Export multiple CSVs
  const handleExportMultipleCSV = async () => {
    try {
      setExporting(true);
      const totalBatchesCalc = Math.ceil(totalNotes / batchSize);

      if (totalBatchesCalc === 0) {
        toast.warning('No notes to export');
        setExporting(false);
        return;
      }

      const headers = [
        'Name', 'Image', 'Background URL', 'Group', 'Odor Profile',
        'Scientific Name', 'Other Names', 'Thumbnails', 'URL', 'Created At'
      ];

      let exportedCount = 0;

      for (let batch = 1; batch <= totalBatchesCalc; batch++) {
        setExportProgress({ current: batch, total: totalBatchesCalc });

        const response = await exportNotesBatch({ page: batch, limit: batchSize }).unwrap();

        if (response.data && Array.isArray(response.data)) {
          let csvRows = [headers.join(',')];

          response.data.forEach(note => {
            const row = [
              escapeCSV(note.name),
              escapeCSV(note.image),
              escapeCSV(note.bgUrl),
              escapeCSV(note.group),
              escapeCSV(note.odorProfile),
              escapeCSV(note.scientificName),
              escapeCSV(serializeComplexData(note.otherNames)),
              escapeCSV(serializeComplexData(note.thumbnails)),
              escapeCSV(note.url),
              escapeCSV(note.createdAt)
            ];
            csvRows.push(row.join(','));
          });

          const csvContent = '\uFEFF' + csvRows.join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = url;
          link.download = `notes_batch_${batch}_of_${totalBatchesCalc}_${response.data.length}_items.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          exportedCount += response.data.length;
        }

        if (batch < totalBatchesCalc) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast.success(`Successfully exported ${exportedCount} notes in ${totalBatchesCalc} files!`);
      setExportProgress({ current: 0, total: 0 });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error?.data?.message || 'Failed to export notes');
      setExportProgress({ current: 0, total: 0 });
    } finally {
      setExporting(false);
    }
  };

  // Import CSV
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
        const rows = parseCSV(text);

        if (rows.length < 2) {
          toast.error('CSV file is empty or invalid');
          setImporting(false);
          return;
        }

        const dataRows = rows.slice(1);

        const parsedNotes = dataRows.map((values, index) => {
          try {
            // Trim values and check for name
            const trimmedValues = values.map(v => (v || '').trim());
            if (!trimmedValues[0]) return null;

            return {
              name: trimmedValues[0],
              image: trimmedValues[1] || '',
              bgUrl: trimmedValues[2] || '',
              group: trimmedValues[3] || '',
              odorProfile: trimmedValues[4] || '',
              scientificName: trimmedValues[5] || '',
              otherNames: deserializeComplexData(trimmedValues[6]),
              thumbnails: deserializeComplexData(trimmedValues[7]),
              createdAt: trimmedValues[8] || '',
              _id: trimmedValues[9] || '',
            };
          } catch (error) {
            console.error(`Error parsing row ${index + 2}:`, error);
            return null;
          }
        }).filter(Boolean);

        if (parsedNotes.length === 0) {
          toast.error('No valid notes found in CSV');
          setImporting(false);
          return;
        }

        const response = await importNotes({ notes: parsedNotes }).unwrap();

        toast.success(`Successfully imported ${response.imported} notes!`);

        if (response.failed > 0) {
          toast.warning(`${response.failed} notes failed to import.`);
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error(error?.data?.message || 'Failed to import notes');
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

  // Download sample CSV
  const handleDownloadSample = () => {
    const headers = [
      'Name', 'Image', 'Background URL', 'Group', 'Odor Profile',
      'Scientific Name', 'Other Names', 'Thumbnails', 'Created At', '_id'
    ];

    const sampleData = [
      [
        'Lemon', 'https:/abc/images/lemon.jpg', 'https:/abc/bg/lemon.jpg', 'Citrus', 'Fresh, Zesty, Bright',
        'Citrus limon', 'Citron|Lime', 'http://abc/thumb/lemon1.jpg|/http://abc/thumb/lemon2.jpg',
        new Date().toISOString(),
        "132456879865464654654654"
      ],
      [
        'Rose', 'https:/abc/images/rose.jpg', 'https:/abc/bg/rose.jpg', 'Floral', 'Sweet, Romantic, Soft',
        'Rosa damascena', 'Damask Rose|Bulgarian Rose', 'http://abc/thumb/rose1.jpg|/http://abc/thumb/rose2.jpg',
        new Date().toISOString(),
        "13245687986546465aa654654"
      ]
    ];

    const csvRows = [headers.join(',')];
    sampleData.forEach(row => {
      csvRows.push(row.map(cell => escapeCSV(cell)).join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'notes_sample_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Sample CSV template downloaded!');
  };

  return (
    <div className="space-y-6">
      <LoadingOverlay isVisible={importing || exporting} importing={importing} exportProgress={exportProgress} />

      <BatchSelectorModal
        isOpen={showBatchSelector}
        onClose={() => {
          setShowBatchSelector(false);
          setSelectedBatches([]);
        }}
        batchSize={batchSize}
        totalItems={totalNotes}
        selectedBatches={selectedBatches}
        setSelectedBatches={setSelectedBatches}
        setExporting={setExporting}
        setExportProgress={setExportProgress}
        exportBatchMutation={exportNotesBatch}
        dataType="notes"
        headers={['Name', 'Image', 'Background URL', 'Group', 'Odor Profile', 'Scientific Name', 'Other Names', 'Thumbnails', 'Created At', '_id']}
        formatRowData={(note) => [
          escapeCSV(note.name),
          escapeCSV(note.image),
          escapeCSV(note.bgUrl),
          escapeCSV(note.group),
          escapeCSV(note.odorProfile),
          escapeCSV(note.scientificName),
          escapeCSV(serializeComplexData(note.otherNames)),
          escapeCSV(serializeComplexData(note.thumbnails)),
          escapeCSV(note.createdAt),
          escapeCSV(note._id),
        ]}
      />

      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
        <h2 className="text-[20px] font-bold text-[#352AA4]">Notes Data Management</h2>
      </div>

      <BatchSizeSelector
        batchSize={batchSize}
        setBatchSize={setBatchSize}
        totalItems={totalNotes}
        setSelectedBatches={setSelectedBatches}
        itemName="notes"
      />

      {/* Export Section */}
      <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-[#352AA4]/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Export All Notes</h3>
            <p className="text-sm text-gray-600">Download as CSV file(s)</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {/* <button
            onClick={handleExportCSV}
            disabled={exporting || totalNotes === 0}
            className="bg-green-600 text-white px-6 py-2.5 rounded-full hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Single CSV
          </button>

          <button
            onClick={handleExportMultipleCSV}
            disabled={exporting || totalNotes === 0}
            className="bg-teal-600 text-white px-6 py-2.5 rounded-full hover:bg-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            Export Multiple CSVs
          </button> */}

          <button
            onClick={() => setShowBatchSelector(true)}
            disabled={exporting || totalNotes === 0}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-full hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Select Specific Batches
          </button>
        </div>
        {totalNotes > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            💡 Total: {totalNotes.toLocaleString()} notes • Batch Size: {batchSize.toLocaleString()} • Batches: {totalBatches}
          </p>
        )}
      </div>

      {/* Import Section */}
      <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-[#352AA4]/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Import Notes</h3>
            <p className="text-sm text-gray-600">Upload CSV file</p>
          </div>
        </div>
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
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
      </div>

      {/* Sample Template */}
      <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-purple-200">
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
        <button
          onClick={handleDownloadSample}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-full hover:bg-purple-700 transition-all duration-300 font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Sample CSV
        </button>
      </div>
    </div>
  );
};

export default NotesExportImport;
