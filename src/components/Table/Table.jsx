import React from 'react';
import view_icon from '../../assets/icons/view-icon.svg';
import user_icon from '../../assets/user-img.png';

const Table = ({ columns, data, renderActions }) => {
  const renderCellContent = (row, accessor, column) => {
    // Handle status column with colored badges
    if (accessor === 'status') {
      return (
        <span
          className={`
            inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold
            ${row[accessor] === 'Active'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : row[accessor] === 'Suspended'
                ? 'bg-red-100 text-red-700 border border-red-300'
                : row[accessor] === 'Inactive'
                  ? 'bg-gray-100 text-gray-700 border border-gray-300'
                  : 'bg-blue-100 text-blue-700 border border-blue-300'
            }
          `}
        >
          {row[accessor]}
        </span>
      );
    }

    // Handle image column
    if (column.type === 'image') {
      return (
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img
              src={row[accessor] || user_icon}
              alt={row.name || 'User'}
              className="w-11 h-11 rounded-full object-cover border-2 border-[#67E9E9] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
              onError={(e) => {
                e.target.src = user_icon;
              }}
            />
            <div className="absolute inset-0 rounded-full bg-[#352AA4]/0 group-hover:bg-[#352AA4]/10 transition-all duration-300"></div>
          </div>
          <span className="capitalize font-medium text-gray-800">{row.name}</span>
        </div>
      );
    }

    // Handle image with name in same column
    if (column.type === 'imageWithName') {
      return (
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img
              src={row.image || row.avatar || user_icon}
              alt={row.name || 'User'}
              className="w-11 h-11 rounded-full object-cover border-2 border-[#67E9E9] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
              onError={(e) => {
                e.target.src = user_icon;
              }}
            />
            <div className="absolute inset-0 rounded-full bg-[#352AA4]/0 group-hover:bg-[#352AA4]/10 transition-all duration-300"></div>
          </div>
          <span className="font-medium text-gray-800">{row[accessor]}</span>
        </div>
      );
    }

    // Default cell content
    return row[accessor];
  };

  return (
    <div className="overflow-x-auto mt-[24px] rounded-2xl border border-[#E1F8F8] shadow-md bg-white">
      <table className="min-w-full">
        <thead className="bg-gradient-to-r from-[#E1F8F8] to-[#D4E8F8]">
          <tr>
            {columns.map(({ label, accessor, align = 'left' }) => (
              <th
                key={accessor}
                className={`px-6 py-4 text-${align} max-lg:px-4 max-lg:py-3 text-[#352AA4] text-[14px] font-bold uppercase tracking-wider`}
                style={{ textAlign: align }}
              >
                {label}
              </th>
            ))}
            {renderActions && (
              <th className="px-6 py-4 text-right max-lg:px-4 max-lg:py-3 text-[#352AA4] text-[14px] font-bold uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E1F8F8] bg-white">
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (renderActions ? 1 : 0)}
                className="text-center py-12"
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium text-sm">No data available</p>
                </div>
              </td>
            </tr>
          )}
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              className="hover:bg-[#E1F8F8]/30 transition-colors duration-200 group"
            >
              {columns.map((column) => {
                const { accessor, align = 'left', className = 'none' } = column;
                return (
                  <td
                    key={accessor}
                    className="px-6 py-5 max-lg:px-4 max-lg:py-4 text-[#7C7C7C] text-[14px] font-medium"
                    style={{ textAlign: align, textTransform: className }}
                  >
                    {renderCellContent(row, accessor, column)}
                  </td>
                );
              })}
              {renderActions && (
                <td className="px-6 py-5 max-lg:px-4 max-lg:py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {renderActions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
