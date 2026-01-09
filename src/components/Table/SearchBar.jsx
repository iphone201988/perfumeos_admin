import React from 'react';
import search_icon from '../../assets/icons/search-icon.svg';
const defaultOptions = [{ label: "Newest", value: "createdAt_desc" }, { label: "Oldest", value: "createdAt_asc" }, { label: "A-Z", value: "name_asc" }, { label: "Z-A", value: "name_desc" }]
const SearchBar = ({ searchTerm, onSearchChange, sortValue, onSortChange, placeholder = "Search users...", loader, options = defaultOptions }) => {
  return (
    <div className="flex gap-[16px] flex-wrap max-sm:gap-[8px] max-sm:w-full">
      {/* Search Input */}
      <div className="flex bg-[#352AA4] px-[10px] py-[8px] rounded-[20px] gap-[8px] items-center max-sm:flex-1 max-sm:min-w-0">
        {loader ? (
          //spin loader
          <div className="w-4 h-4 bg-gray-300 rounded flex-shrink-0 animate-spin"></div>
        ) : (
          <img src={search_icon} alt="Search" className="w-4 h-4 flex-shrink-0" />
        )}

        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={onSearchChange}
          className="placeholder:!text-white bg-transparent outline-none text-white w-full max-sm:text-sm max-sm:placeholder:text-sm"
        />
      </div>


      {/* Sort Dropdown */}
      <div className="flex text-white bg-[#352AA4] px-[10px] py-[8px] rounded-[20px] gap-[8px] items-center max-sm:flex-shrink-0">
        <span className="font-light max-sm:text-sm max-sm:hidden">Sort by:</span>
        <span className="font-light max-sm:text-sm sm:hidden">Sort:</span>
        <select
          value={sortValue}
          onChange={onSortChange}
          className="font-semibold bg-[#352AA4] outline-none text-white cursor-pointer max-sm:text-sm"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div >
  );
};

export default SearchBar;
