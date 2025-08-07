// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9fafb] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-8xl font-extrabold text-[#352AA4] mb-4 select-none">
          404
        </h1>
        <p className="text-2xl font-semibold text-[#7C7C7C] mb-6">
          Oops! The page you are looking for <br /> does not exist.
        </p>
        <p className="mb-8 text-[#555555]">
          It might have been moved or deleted. Try returning to the dashboard.
        </p>
        <Link
          to="/"
          className="
            inline-block
            px-6
            py-3
            text-white
            bg-[#352AA4]
            rounded-lg
            font-semibold
            hover:bg-[#2a217a]
            transition-colors
            focus:outline-none
            focus:ring-4
            focus:ring-[#c7d0f9]
          "
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
