// components/ManagePerfum/Accords/AccordItem.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";

const AccordItem = React.memo(({ accord, index, onUpdate, onRemove }) => {
  const [name, setName] = useState(accord.name || "");
  const [width, setWidth] = useState(accord.width || 0);
  const [backgroundColor, setBackgroundColor] = useState(accord.backgroundColor || "#000000");

  const updateTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (accord.name !== name) setName(accord.name || "");
  }, [accord.name]);

  useEffect(() => {
    if (accord.width !== width) setWidth(accord.width || 0);
  }, [accord.width]);

  useEffect(() => {
    if (accord.backgroundColor !== backgroundColor) {
      setBackgroundColor(accord.backgroundColor || "#000000");
    }
  }, [accord.backgroundColor]);

  const debouncedUpdate = useCallback((field, value) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onUpdate(index, field, value);
      }
    }, 300);
  }, [index, onUpdate]);

  const handleNameChange = useCallback((e) => {
    const newName = e.target.value;
    setName(newName);
    debouncedUpdate("name", newName);
  }, [debouncedUpdate]);

  const handleWidthChange = useCallback((e) => {
    const newWidth = Number(e.target.value);
    setWidth(newWidth);
    debouncedUpdate("width", newWidth);
  }, [debouncedUpdate]);

  const handleColorChange = useCallback((e) => {
    const newColor = e.target.value;
    setBackgroundColor(newColor);
    debouncedUpdate("backgroundColor", newColor);
  }, [debouncedUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <div className="flex flex-wrap gap-4 items-center border p-3 rounded-lg bg-white">
      <input
        type="text"
        placeholder="Accord name"
        value={name}
        onChange={handleNameChange}
        className="flex-1 min-w-[150px] bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="color"
        value={backgroundColor}
        onChange={handleColorChange}
        className="h-10 w-10 p-0 border-0 cursor-pointer rounded"
        title="Pick background color"
      />

      <div className="flex-1 min-w-[200px] flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          value={width}
          onChange={handleWidthChange}
          className="flex-1 cursor-pointer"
        />
        <span className="w-12 text-center font-mono text-sm">{width}%</span>
      </div>

      <button
        type="button"
        onClick={handleRemove}
        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
        aria-label="Remove accord"
      >
        ✕
      </button>
    </div>
  );
});

AccordItem.displayName = 'AccordItem';
export default AccordItem;
