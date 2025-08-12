// EditPerfume.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useGetNotesQuery, useGetPerfumeByIdQuery, useGetPerfumersQuery, useUpdatePerfumeMutation } from "../../api";
import ImageUploader from "../Form/ImageUploader";
import FormField from "../Form/FormField";
import { useNavigate, useParams } from "react-router-dom";
import IntendedForMultiSelect from "../Form/IntendedForMultiSelect";
import SeasonFields from "../Form/SeasonFields";
import AccordsList from "./Accords/AccordsList";
import { hexToRgb, rgbToHex } from "../../Utils/function";
import Select from 'react-select';
import Loader from "../Loader/Loader";

const EditPerfume = () => {
  const params = useParams();
  const navigate = useNavigate();

  const { data: perfumeData, isLoading, error } = useGetPerfumeByIdQuery(params.id);
  const { data: notesResponse, isLoading: notesLoading } = useGetNotesQuery();
  const { data: perfumersResponse, isLoading: perfumersLoading } = useGetPerfumersQuery();
  const perfume = useMemo(() => perfumeData?.data || null, [perfumeData]);
  const [updating, setUpdating] = useState(false);
  const [updatePerfume, { isLoading: updateLoading }] = useUpdatePerfumeMutation();
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

  const [mainAccords, setMainAccords] = useState([]);
  const [perfumerIds, setPerfumerIds] = useState([]);
  const [fragranceTop, setFragranceTop] = useState([]);
  const [fragranceMiddle, setFragranceMiddle] = useState([]);
  const [fragranceBottom, setFragranceBottom] = useState([]);
  const [fragranceNotes, setFragranceNotes] = useState([]);

  useEffect(() => {
    if (perfume && perfumersResponse?.data && notesResponse?.data) {
      setMainAccords((perfume.mainAccords || []).map((a, index) => ({
        ...a,
        backgroundColor: rgbToHex(a.backgroundColor || "#000000"),
        width: a.width?.split("%")[0],
        id: index,
      })) || []);
      setForm({
        name: perfume.name || "",
        brand: perfume.brand || "",
        image: perfume.image || "",
        description: perfume.description || "",
        intendedFor: perfume.intendedFor || [],
        yearRelease: perfume.year || "",
        concentration: perfume.concentration || "",
        occasionDay: perfume.occasions?.find((o) => o.name === "day")?.width.split("%")[0] || "",
        occasionEvening: perfume.occasions?.find((o) => o.name === "night")?.width.split("%")[0] || "",
        seasonWinter: perfume.seasons?.find((s) => s.name === "winter")?.width.split("%")[0] || "",
        seasonSummer: perfume.seasons?.find((s) => s.name === "summer")?.width.split("%")[0] || "",
        seasonAutumn: perfume.seasons?.find((s) => s.name === "fall")?.width.split("%")[0] || "",
        seasonSpring: perfume.seasons?.find((s) => s.name === "spring")?.width.split("%")[0] || "",
      });

      // Convert perfumer IDs to react-select format
      const perfumerIdList = Array.isArray(perfume.perfumers)
        ? perfume.perfumers.map((p) => p.perfumerId || p._id)
        : [];
      const selectedPerfumers = perfumerIdList.map(id => {
        const perfumer = perfumersResponse.data.find(p => p._id === id);
        return perfumer ? { value: perfumer._id, label: perfumer.name } : null;
      }).filter(Boolean);

      // Convert note IDs to react-select format
      const topNotes = perfume.notes?.top?.map((n) => {
        const note = notesResponse.data.find(note => note._id === (n.noteId || n._id));
        return note ? { value: note._id, label: note.name } : null;
      }).filter(Boolean) || [];

      const middleNotes = perfume.notes?.middle?.map((n) => {
        const note = notesResponse.data.find(note => note._id === (n.noteId || n._id));
        return note ? { value: note._id, label: note.name } : null;
      }).filter(Boolean) || [];

      const baseNotes = perfume.notes?.base?.map((n) => {
        const note = notesResponse.data.find(note => note._id === (n.noteId || n._id));
        return note ? { value: note._id, label: note.name } : null;
      }).filter(Boolean) || [];

      const noteNotes = perfume.notes?.note?.map((n) => {
        const note = notesResponse.data.find(note => note._id === (n.noteId || n._id));
        return note ? { value: note._id, label: note.name } : null;
      }).filter(Boolean) || [];

      setPerfumerIds(selectedPerfumers);
      setFragranceTop(topNotes);
      setFragranceMiddle(middleNotes);
      setFragranceBottom(baseNotes);
      setFragranceNotes(noteNotes);
    }
  }, [perfume, perfumersResponse?.data, notesResponse?.data]);

  // Convert data to react-select format
  const noteOptions = useMemo(() => {
    if (!notesResponse?.data) return [];
    return notesResponse.data.map((note) => ({
      value: note._id,
      label: note.name,
    }));
  }, [notesResponse?.data]);

  const perfumerOptions = useMemo(() => {
    if (!perfumersResponse?.data) return [];
    return perfumersResponse.data.map((p) => ({
      value: p._id,
      label: p.name,
    }));
  }, [perfumersResponse?.data]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onImageSelect = useCallback((url, file) => {
    setForm((pre) => ({ ...pre, image: url }));
    setFile(file);
  }, []);

  const handleIntendedForChange = useCallback((newValues) => {
    setForm((prev) => ({
      ...prev,
      intendedFor: Array.isArray(newValues) ? newValues : [newValues],
    }));
  }, []);

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

  // React-select change handlers
  const onPerfumerChange = useCallback((selectedOptions) => {
    setPerfumerIds(selectedOptions || []);
  }, []);

  const onTopNotesChange = useCallback((selectedOptions) => {
    setFragranceTop(selectedOptions || []);
  }, []);

  const onMiddleNotesChange = useCallback((selectedOptions) => {
    setFragranceMiddle(selectedOptions || []);
  }, []);

  const onBottomNotesChange = useCallback((selectedOptions) => {
    setFragranceBottom(selectedOptions || []);
  }, []);

  const onNoteNotesChange = useCallback((selectedOptions) => {
    setFragranceNotes(selectedOptions || []);
  }, []);

  const handleAddAccord = useCallback(() => {
    setMainAccords((prev, i) => [
      ...prev,
      {
        name: "",
        width: 50,
        backgroundColor: "#000000",
        id: i,
      },
    ]);
  }, []);

  const handleRemoveAccord = useCallback((idx) => {
    setMainAccords((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // MOVED BEFORE THE EARLY RETURN - This was the issue!
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Basic fields - Map frontend field names to backend expected names
    formData.append('name', form.name);
    formData.append('brand', form.brand);
    formData.append('description', form.description);
    formData.append('year', form.yearRelease); // Backend expects 'year', not 'yearRelease'
    formData.append('concentration', form.concentration);

    // Handle image file upload
    if (file) {
      formData.append('file', file); // Changed from 'file' to 'image' to match backend
    }

    // Complex objects as JSON strings
    formData.append('intendedFor', JSON.stringify(form.intendedFor));
    formData.append('perfumers', JSON.stringify(perfumerIds.map(p => ({ perfumerId: p.value }))));
    console.log("checking mainAccords", mainAccords)
    // Filter out empty main accords
    const validMainAccords = mainAccords.filter(accord =>
      accord.name && accord.name.trim() != '' && accord.width != '0%'
    );
    formData.append('mainAccords', JSON.stringify(validMainAccords.map(accord => ({
      name: accord.name,
      width: accord.width ? `${accord.width}%` : '0%',
      backgroundColor: hexToRgb(accord.backgroundColor)
    }))));

    formData.append('notes', JSON.stringify({
      top: fragranceTop.map(note => ({ noteId: note.value })),
      middle: fragranceMiddle.map(note => ({ noteId: note.value })),
      base: fragranceBottom.map(note => ({ noteId: note.value })),
      note: fragranceNotes.map(note => ({ noteId: note.value }))
    }));

    formData.append('occasions', JSON.stringify([
      { name: "day", width: form.occasionDay },
      { name: "night", width: form.occasionEvening }
    ]));

    formData.append('seasons', JSON.stringify([
      { name: "winter", width: form.seasonWinter },
      { name: "summer", width: form.seasonSummer },
      { name: "fall", width: form.seasonAutumn },
      { name: "spring", width: form.seasonSpring }
    ]));

    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      setUpdating(true);
      await updatePerfume({ id: params.id, formData }).unwrap();
      alert("Perfume updated successfully!");
      navigate(`/perfumes/${params.id}`);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update perfume");
    } finally {
      setUpdating(false);
    }
  }, [form, perfumerIds, fragranceTop, fragranceMiddle, fragranceBottom, fragranceNotes, mainAccords, params.id]);

  // Custom styles for react-select to match your design
   const customStyles = {
        control: (provided) => ({
            ...provided,
            border: '1px solid #eeeeee',
            borderRadius: '16px',
            minHeight: '40px',
            fontSize: '16px',
            padding:'8px 6px',
            backgroundColor:'#fff'
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#E1F8F8',
            borderRadius: '8px',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#0891b2',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#0891b2',
            ':hover': {
                backgroundColor: '#0891b2',
                color: 'white',
            },
        }),
    };

  // Early return AFTER all hooks have been called
  if (isLoading) {
    return <Loader message="Geting perfume data" />;
  }; 
  if (notesLoading || perfumersLoading) {
    return <Loader message="Loading perfume data" />;
  }
  if(updateLoading){
    return <Loader message="Updating perfume" />
  }

  return (
    <div>
      <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
        <h6 className="text-[20px] font-semibold text-[#352AA4] mb-4">Edit Perfume</h6>
        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
          <div className="flex gap-[20px] flex-col max-md:flex-wrap max-md:gap-[16px]">
            <ImageUploader onImageSelect={onImageSelect} currentImage={form.image} />
            <div className="flex gap-[16px] max-md:flex-wrap">
               <FormField
              label="Perfume Name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Enter here"
              required
            />
            <FormField
              label="Perfume Brand Name"
              name="brand"
              value={form.brand}
              onChange={handleInputChange}
              placeholder="Enter here"
              required
            />
            </div>
          </div>

          <div className="flex gap-[16px] max-md:flex-wrap">
            <IntendedForMultiSelect
              value={form.intendedFor}
              onChange={handleIntendedForChange}
            />
            <FormField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Enter here"
              textAera="true"
              rows="6"
            />
          </div>

          <div className="flex gap-[16px] max-md:flex-wrap">
            <FormField
              label="Concentration"
              name="concentration"
              value={form.concentration}
              onChange={handleInputChange}
              placeholder="Enter here"
            />
            <FormField
              label="Year Release"
              name="yearRelease"
              type="number"
              value={form.yearRelease}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear()}
              placeholder="Enter here"
            />
          </div>

          <div>
            <h4 className="text-[20px] font-medium mt-4 mb-4">Occasion</h4>
            <div className="flex gap-[16px] max-md:flex-wrap">
              <FormField
                label="Occasion (Day Time)"
                name="occasionDay"
                value={form.occasionDay}
                onChange={handleInputChange}
                placeholder="Enter here"
              />
              <FormField
                label="Occasion (Evening)"
                name="occasionEvening"
                value={form.occasionEvening}
                onChange={handleInputChange}
                placeholder="Enter here"
              />
            </div>
          </div>

          <SeasonFields form={form} onInputChange={handleInputChange} />

          {/* Perfumer Multi-Select */}
          <div className="flex flex-col">
            <label className="text-[#7C7C7C] text-[14px] mb-1">Perfumer</label>
            <Select
              isMulti
              options={perfumerOptions}
              value={perfumerIds}
              onChange={onPerfumerChange}
              placeholder="Select perfumers..."
              styles={customStyles}
              closeMenuOnSelect={false}
            />
          </div>

          {/* Fragrance Notes Multi-Selects */}
          <div>
            <h4 className="text-[20px] font-medium mt-4 mb-4">Fragrance Notes</h4>
            <div className="flex gap-[16px] max-md:flex-wrap max-lg:flex-wrap">
              <div className="flex flex-col w-full">
                <label className="text-[#7C7C7C] text-[14px] mb-1">Top Notes</label>
                <Select
                  isMulti
                  options={noteOptions}
                  value={fragranceTop}
                  onChange={onTopNotesChange}
                  placeholder="Select top notes..."
                  styles={customStyles}
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="text-[#7C7C7C] text-[14px] mb-1">Middle Notes</label>
                <Select
                  isMulti
                  options={noteOptions}
                  value={fragranceMiddle}
                  onChange={onMiddleNotesChange}
                  placeholder="Select middle notes..."
                  styles={customStyles}
                  closeMenuOnSelect={false}
                />
              </div>
            </div>

            <div className="flex gap-[16px] max-md:flex-wrap max-lg:flex-wrap">
              <div className="flex flex-col w-full">
                <label className="text-[#7C7C7C] text-[14px] mb-1 mt-[12px]">Base Notes</label>
                <Select
                  isMulti
                  options={noteOptions}
                  value={fragranceBottom}
                  onChange={onBottomNotesChange}
                  placeholder="Select base notes..."
                  styles={customStyles}
                  closeMenuOnSelect={false}
                />
              </div>
              {/* Other Notes Multi-Select */}
              {fragranceNotes.length > 0 && (
                <div className="flex flex-col w-full">
                  <label className="text-[#7C7C7C] text-[14px] mb-1">Other Notes</label>
                  <Select
                    isMulti
                    options={noteOptions}
                    value={fragranceNotes}
                    onChange={onNoteNotesChange}
                    placeholder="Select other notes..."
                    styles={customStyles}
                    closeMenuOnSelect={false}
                  />
                </div>

              )}
            </div>
          </div>

          <AccordsList
            accords={mainAccords}
            onUpdate={handleAccordUpdate}
            onAdd={handleAddAccord}
            onRemove={handleRemoveAccord}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-[16px] mt-[24px] pt-4 border-t">
            <button
              type="button"
              className="btn-sec px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn-pri px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={updating}
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPerfume;
