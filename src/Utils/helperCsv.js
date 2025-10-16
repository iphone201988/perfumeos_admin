// src/utils/csvHelpers.js

export const escapeCSV = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
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



