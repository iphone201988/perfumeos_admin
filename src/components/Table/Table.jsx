
import React from 'react';
import view_icon from '../../assets/icons/view-icon.svg';
import user_icon from '../../assets/user-img.png';

const Table = ({ columns, data, renderActions }) => {
  const renderCellContent = (row, accessor, column) => {
    // Handle status column with colored text
    if (accessor === 'status') {
      return (
        <span
          className={
            row[accessor] === 'Active'
              ? 'text-[#6AE66F]'
              : row[accessor] === 'Suspended'
                ? 'text-[#FF4040]'
                : ''
          }
        >
          {row[accessor]}
        </span>
      );
    }

    // Handle image column
    if (column.type === 'image') {
      return (
        <div className="flex items-center gap-3">
          <img
            src={row[accessor] || user_icon} // fallback image
            alt={row.name || 'User'}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#67E9E9]"
            onError={(e) => {
              e.target.src = user_icon; // fallback on error
            }}
          />
          <span>{row.name}</span>
        </div>
      );
    }

    // Handle image with name in same column
    if (column.type === 'imageWithName') {
      return (
        <div className="flex items-center gap-3">
          <img
            src={row.image || row.avatar || user_icon}
            alt={row.name || 'User'}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#67E9E9]"
            onError={(e) => {
              e.target.src = user_icon
            }}
          />
          <span>{row[accessor]}</span>
        </div>
      );
    }

    // Default cell content
    return row[accessor];
  };

  return (
    <div className="overflow-x-auto mt-[24px]">
      <table className="min-w-full">
        <thead className="text-[#352AA4] text-[14px] font-medium">
          <tr>
            {columns.map(({ label, accessor, align = 'left', }) => (
              <th
                key={accessor}
                className={`px-4 py-3 text-${align} max-lg:p-[12px] `}
                style={{ textAlign: align, }}
              >
                {label}
              </th>
            ))}
            {renderActions && (
              <th className="px-4 py-3 text-right max-lg:p-[12px]">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="text-[#7C7C7C] text-[14px] font-medium">
          {data.length === 0 && (
            <tr>
              {/* <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-6">
                No data found
              </td> */}
            </tr>
          )}
          {data.map((row, idx) => (
            <tr key={row.id || idx} className="border-t border-[rgba(21,201,201,0.50)]">
              {columns.map((column) => {
                const { accessor, align = 'left',className='none' } = column;
                return (
                  <td
                    key={accessor}
                    className={`px-4 py-6 max-lg:p-[12px] `}
                    style={{ textAlign: align , textTransform: className }}
                  >
                    {renderCellContent(row, accessor, column)}
                  </td>
                );
              })}
              {renderActions && (
                <td className="px-4 py-6 max-lg:p-[12px] text-right">
                  {renderActions(row)}
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

