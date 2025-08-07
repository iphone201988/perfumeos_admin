// hooks/usePerfumeForm.js
import { useState, useCallback, useMemo, useEffect } from "react";
import { rgbToHex } from "../Utils/function";

export const usePerfumeForm = (perfume) => {
  const [perfumerIds, setPerfumerIds] = useState([]);
  const [fragranceTop, setFragranceTop] = useState([]);
  const [fragranceMiddle, setFragranceMiddle] = useState([]);
  const [fragranceBottom, setFragranceBottom] = useState([]);
  const [fragranceNotes, setFragranceNotes] = useState([]);
  const [mainAccords, setMainAccords] = useState([]);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    image: "",
    intendedFor: [],
    description: "",
    yearRelease: "",
    concentration: "",
    occasionDay: "",
    occasionEvening: "",
    seasonWinter: "",
    seasonSummer: "",
    seasonAutumn: "",
    seasonSpring: "",
  });

  // Initialize form data
  useEffect(() => {
    if (perfume && !isFormInitialized) {
      const initialForm = {
        name: perfume.name || "",
        brand: perfume.brand || "",
        image: perfume.image || "",
        description: perfume.description || "",
        intendedFor: perfume.intendedFor || [],
        yearRelease: perfume.year || "",
        concentration: perfume.concentration || "",
        occasionDay:
          perfume.occasions?.find((o) => o.name === "day")?.width || "",
        occasionEvening:
          perfume.occasions?.find((o) => o.name === "night")?.width || "",
        seasonWinter:
          perfume.seasons?.find((s) => s.name === "winter")?.width || "",
        seasonSummer:
          perfume.seasons?.find((s) => s.name === "summer")?.width || "",
        seasonAutumn:
          perfume.seasons?.find((s) => s.name === "fall")?.width || "",
        seasonSpring:
          perfume.seasons?.find((s) => s.name === "spring")?.width || "",
      };

      const perfumerIdList = Array.isArray(perfume.perfumers)
        ? perfume.perfumers.map((p) => p.perfumerId || p._id)
        : [];
      const topNotes = perfume.notes?.top?.map((n) => n.noteId || n._id) || [];
      const middleNotes =
        perfume.notes?.middle?.map((n) => n.noteId || n._id) || [];
      const baseNotes =
        perfume.notes?.base?.map((n) => n.noteId || n._id) || [];
      const noteNotes =
        perfume.notes?.note?.map((n) => n.noteId || n._id) || [];

      const initialAccords = (perfume.mainAccords || []).map((a, index) => ({
        ...a,
        backgroundColor: rgbToHex(a.backgroundColor || "#000000"),
        width: a.width?.split("%")[0],
        id: a._id || `accord-${index}-${Date.now()}`,
      }));

      setForm(initialForm);
      setPerfumerIds(perfumerIdList);
      setFragranceTop(topNotes);
      setFragranceMiddle(middleNotes);
      setFragranceBottom(baseNotes);
      setFragranceNotes(noteNotes);
      setMainAccords(initialAccords);
      setIsFormInitialized(true);
    }
  }, [perfume, isFormInitialized]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);
  const onImageSelect = (url, file) => {
    setForm((pre) => ({ ...pre, image: url }));
    setFile(file);
  };

  const handleAccordUpdate = useCallback((idx, field, value) => {
    setMainAccords((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        [field]: field === "backgroundColor" ? rgbToHex(value) : value,
      };
      return updated;
    });
  }, []);

  const handleAddAccord = useCallback(() => {
    setMainAccords((prev) => [
      ...prev,
      {
        name: "",
        width: 0,
        backgroundColor: "#000000",
        id: `accord-new-${Date.now()}-${Math.random()}`,
      },
    ]);
  }, []);

  const handleRemoveAccord = useCallback((idx) => {
    setMainAccords((prev) => prev.filter((_, i) => i !== idx));
  }, []);
  const handleIntendedForChange = useCallback((newValues) => {
    setForm((prev) => ({
      ...prev,
      intendedFor: Array.isArray(newValues) ? newValues : [newValues],
    }));
  }, []);
  return {
    form,
    perfumerIds,
    fragranceTop,
    fragranceMiddle,
    fragranceBottom,
    fragranceNotes,
    mainAccords,
    isFormInitialized,
    setPerfumerIds,
    setFragranceTop,
    setFragranceMiddle,
    setFragranceBottom,
    setFragranceNotes,
    handleInputChange,
    handleAccordUpdate,
    handleAddAccord,
    handleRemoveAccord,
    onImageSelect,
    handleIntendedForChange
  };
};
