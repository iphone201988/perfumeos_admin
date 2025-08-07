import React from 'react';
import search_icon from '../../assets/icons/search-icon.svg';

const SearchBar = ({ searchTerm, onSearchChange, sortValue, onSortChange }) => {
  return (
    <div className="flex gap-[16px] flex-wrap max-sm:gap-[8px] max-sm:w-full">
      {/* Search Input */}
      <div className="flex bg-[#352AA4] px-[10px] py-[8px] rounded-[20px] gap-[8px] items-center max-sm:flex-1 max-sm:min-w-0">
        <img src={search_icon} alt="Search" className="w-4 h-4 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search users..."
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
          <option value="date_desc">Newest</option>
          <option value="date_asc">Oldest</option>
          <option value="name_asc">A-Z</option>
          <option value="name_desc">Z-A</option>
        </select>
      </div>
    </div>
  );
};

export default SearchBar;
