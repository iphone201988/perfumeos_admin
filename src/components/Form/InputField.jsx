import React from 'react';

const InputField = ({ label, placeholder, value, onChange, required = false }) => (
  <label className='flex flex-col w-full'>
    <span className='text-[#7C7C7C] text-[14px]'>{label}</span>
    <input
      className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  </label>
);

export default InputField;
