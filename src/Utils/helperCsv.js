// src/utils/csvHelpers.js

export const escapeCSV = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const serializeComplexData = (data) => {
  if (!data) return '';
  if (Array.isArray(data)) {
    return data.map(item => {
      if (typeof item === 'object') {
        return JSON.stringify(item);
      }
      return item;
    }).join('|');
  }
  if (typeof data === 'object') {
    return JSON.stringify(data);
  }
  return String(data);
};

export const deserializeComplexData = (str) => {
  if (!str || str.trim() === '') return [];
  return str.split('|').map(item => {
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  });
};

/**
 * Robust CSV parser that handles:
 * 1. Quoted fields containing commas, newlines, and carriage returns
 * 2. Escaped double quotes ("")
 * 3. Windows (\r\n) and Unix (\n) line endings
 */
export const parseCSV = (text) => {
  if (!text) return [];
  const cleanText = text.replace(/^\uFEFF/, '');
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        currentField += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row
      currentRow.push(currentField);

      // Only add row if it has content (not just an empty line)
      if (currentRow.some(field => field.trim() !== '')) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentField = '';

      // Skip extra \n in \r\n
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      // Regular character
      currentField += char;
    }
  }

  // Add last record if exists
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(field => field.trim() !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
};



