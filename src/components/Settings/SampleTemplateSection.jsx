// src/components/Settings/SampleTemplateSection.jsx
import React from 'react';
import { toast } from 'react-toastify';
import { escapeCSV } from '../../utils/helperCsv';

const SampleTemplateSection = () => {
  const handleDownloadSampleCSV = () => {
    const headers = [
      'Name', 'Brand', 'Image', 'Concentration', 'Description', 'Year',
      'Intended For', 'Seasons', 'Occasions', 'Occasion Day Votes',
      'Occasion Night Votes', 'Main Accords', 'Perfumers',
      'Top Notes', 'Middle Notes', 'Base Notes', 'Other Notes', 'Created At'
    ];

    const sampleData = [
      [
        'Bleu de Chanel', 'Chanel', 'https://example.com/chanel.jpg',  'Eau de Parfum',
        'A woody aromatic fragrance with citrus notes.',
        '2010', 'men',
        '{"name":"winter","width":"30%"}|{"name":"spring","width":"25%"}',
        '{"name":"day","width":"60%"}|{"name":"night","width":"40%"}',
        '150', '100',
        '{"name":"woody","width":"80%","backgroundColor":"rgb(139, 69, 19)"}',
        '{"name":"Jacques Polge"}',
        '{"name":"Lemon"}|{"name":"Bergamot"}',
        '{"name":"Ginger"}|{"name":"Nutmeg"}',
        '{"name":"Incense"}|{"name":"Cedar"}',
        '', new Date().toISOString()
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
    link.download = 'perfumes_sample_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Sample CSV template downloaded!');
  };

  return (
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
            Download a sample CSV file with example perfumes to understand the correct data structure.
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
  );
};

export default SampleTemplateSection;
