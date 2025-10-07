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
import { toast } from "react-toastify";

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

  // Add validation states
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imageError, setImageError] = useState('');

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

  // Validation rules (same as AddPerfume)
  const validateField = useCallback((name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value || value.trim() === '') {
          error = 'Perfume name is required';
        } else if (value.trim().length < 2) {
          error = 'Perfume name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          error = 'Perfume name must be less than 100 characters';
        }
        break;

      case 'brand':
        if (!value || value.trim() === '') {
          error = 'Brand name is required';
        } else if (value.trim().length < 2) {
          error = 'Brand name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          error = 'Brand name must be less than 50 characters';
        }
        break;

      case 'description':
        if (!value || value.trim() === '') {
          error = 'Description is required';
        } else if (value.trim().length < 10) {
          error = 'Description must be at least 10 characters';
        } else if (value.trim().length > 1000) {
          error = 'Description must be less than 1000 characters';
        }
        break;

      // case 'concentration':
      //   if (!value || value.trim() === '') {
      //     error = 'Concentration is required';
      //   }
      //   break;

      case 'yearRelease':
        const currentYear = new Date().getFullYear();
        const yearNum = parseInt(value);
        if (!value) {
          error = 'Release year is required';
        } else if (isNaN(yearNum) || yearNum < 1900) {
          error = 'Year must be 1900 or later';
        } else if (yearNum > currentYear) {
          error = `Year cannot be later than ${currentYear}`;
        }
        break;

      case 'occasionDay':
      case 'occasionEvening':
        const occasionNum = parseInt(value);
        if (value !== '' && (isNaN(occasionNum) || occasionNum < 0 || occasionNum > 100)) {
          error = 'Value must be between 0 and 100';
        }
        break;

      case 'seasonWinter':
      case 'seasonSummer':
      case 'seasonAutumn':
      case 'seasonSpring':
        const seasonNum = parseInt(value);
        if (value !== '' && (isNaN(seasonNum) || seasonNum < 0 || seasonNum > 100)) {
          error = 'Value must be between 0 and 100';
        }
        break;

      default:
        break;
    }

    return error;
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    const errors = {};

    // Validate basic fields
    Object.keys(form).forEach(field => {
      if (field !== 'image' && field !== 'intendedFor') {
        const error = validateField(field, form[field]);
        if (error) errors[field] = error;
      }
    });

    // Validate intended for
    if (!form.intendedFor || form.intendedFor.length === 0) {
      errors.intendedFor = 'Please select at least one intended audience';
    }

    // Validate perfumers
    if (!perfumerIds || perfumerIds.length === 0) {
      errors.perfumers = 'Please select at least one perfumer';
    }

    // Validate at least one fragrance note category
    const hasNotes = fragranceTop.length > 0 || fragranceMiddle.length > 0 ||
      fragranceBottom.length > 0 || fragranceNotes.length > 0;
    if (!hasNotes) {
      errors.notes = 'Please add at least one fragrance note';
    }

    // Validate main accords
    const validAccords = mainAccords.filter(accord =>
      accord.name && accord.name.trim() !== '' && accord.width !== '0%'
    );
    if (validAccords.length === 0) {
      errors.accords = 'Please add at least one main accord';
    }

    // Validate season totals
    const seasonTotal = parseInt(form.seasonWinter || 0) +
      parseInt(form.seasonSummer || 0) +
      parseInt(form.seasonAutumn || 0) +
      parseInt(form.seasonSpring || 0);
    if (seasonTotal > 100) {
      errors.seasons = 'Total season percentages cannot exceed 100%';
    }

    // Validate occasion totals
    const occasionTotal = parseInt(form.occasionDay || 0) + parseInt(form.occasionEvening || 0);
    if (occasionTotal > 100) {
      errors.occasions = 'Total occasion percentages cannot exceed 100%';
    }

    return errors;
  }, [form, perfumerIds, fragranceTop, fragranceMiddle, fragranceBottom, fragranceNotes, mainAccords, validateField]);

  useEffect(() => {
    if (perfume && perfumersResponse?.data && notesResponse?.data) {
      setMainAccords((perfume.mainAccords || []).map((a, index) => ({
        ...a,
        backgroundColor: rgbToHex(a.backgroundColor || "#000000"),
        width: a.width?.split("%")[0],
        id: index,
      })) || []);

      const formData = {
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
      };

      setForm(formData);

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

      // Clear any existing errors when loading data
      setFormErrors({});
      setTouched({});
      setImageError('');
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

    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate field and update errors
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateField]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, form[name]);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateField, form]);

  const onImageSelect = useCallback((url, file, error) => {
    if (error) {
      setImageError(error);
      setForm((prev) => ({ ...prev, image: prev.image })); // Keep existing image on error
      setFile(null);
    } else {
      setForm((prev) => ({ ...prev, image: url || prev.image }));
      setFile(file);
      setImageError('');
      setFormErrors(prev => ({ ...prev, image: '' }));
    }
  }, []);

  const handleIntendedForChange = useCallback((newValues) => {
    const values = Array.isArray(newValues) ? newValues : [newValues];
    setForm((prev) => ({ ...prev, intendedFor: values }));

    if (values.length > 0) {
      setFormErrors(prev => ({ ...prev, intendedFor: '' }));
    }
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

    setFormErrors(prev => ({ ...prev, accords: '' }));
  }, []);

  // React-select change handlers with validation
  const onPerfumerChange = useCallback((selectedOptions) => {
    setPerfumerIds(selectedOptions || []);
    if (selectedOptions && selectedOptions.length > 0) {
      setFormErrors(prev => ({ ...prev, perfumers: '' }));
    }
  }, []);

  const onTopNotesChange = useCallback((selectedOptions) => {
    setFragranceTop(selectedOptions || []);
    setFormErrors(prev => ({ ...prev, notes: '' }));
  }, []);

  const onMiddleNotesChange = useCallback((selectedOptions) => {
    setFragranceMiddle(selectedOptions || []);
    setFormErrors(prev => ({ ...prev, notes: '' }));
  }, []);

  const onBottomNotesChange = useCallback((selectedOptions) => {
    setFragranceBottom(selectedOptions || []);
    setFormErrors(prev => ({ ...prev, notes: '' }));
  }, []);

  const onNoteNotesChange = useCallback((selectedOptions) => {
    setFragranceNotes(selectedOptions || []);
    setFormErrors(prev => ({ ...prev, notes: '' }));
  }, []);

  const handleAddAccord = useCallback(() => {
    setMainAccords((prev) => [
      ...prev,
      {
        name: "",
        width: 50,
        backgroundColor: "#000000",
        id: prev.length,
      },
    ]);
  }, []);

  const handleRemoveAccord = useCallback((idx) => {
    setMainAccords((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validate entire form
    const errors = validateForm();
    setFormErrors(errors);

    // Mark all fields as touched to show errors
    const allTouched = {};
    Object.keys(form).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix all validation errors before updating");
      return;
    }

    const formData = new FormData();

    // Basic fields
    formData.append('name', form.name);
    formData.append('brand', form.brand);
    formData.append('description', form.description);
    formData.append('year', form.yearRelease);
    formData.append('concentration', form.concentration);

    // Handle image file upload
    if (file) {
      formData.append('file', file);
    }

    // Complex objects as JSON strings
    formData.append('intendedFor', JSON.stringify(form.intendedFor));
    formData.append('perfumers', JSON.stringify(perfumerIds.map(p => ({ perfumerId: p.value }))));

    const validMainAccords = mainAccords.filter(accord =>
      accord.name && accord.name.trim() !== '' && accord.width !== '0%'
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

    try {
      setUpdating(true);
      await updatePerfume({ id: params.id, formData }).unwrap();
      toast.success("Perfume updated successfully!");
      navigate(`/perfumes/${params.id}`);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update perfume: " + (err?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  }, [form, file, perfumerIds, fragranceTop, fragranceMiddle, fragranceBottom, fragranceNotes, mainAccords, params.id, updatePerfume, navigate, validateForm]);

  // Custom styles for react-select with error states
  const getCustomStyles = (hasError) => ({
    control: (provided) => ({
      ...provided,
      border: `1px solid ${hasError ? '#ef4444' : '#eeeeee'}`,
      borderRadius: '16px',
      minHeight: '40px',
      fontSize: '16px',
      padding: '8px 6px',
      backgroundColor: '#fff',
      boxShadow: hasError ? '0 0 0 1px #ef4444' : provided.boxShadow,
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
  });

  // Early return AFTER all hooks have been called
  if (isLoading) {
    return <Loader message="Getting perfume data" />;
  }
  if (notesLoading || perfumersLoading) {
    return <Loader message="Loading perfume data" />;
  }
  if (updateLoading) {
    return <Loader message="Updating perfume" />
  }
  if (error) {
    return <div className="text-red-500 text-center">Error loading perfume data</div>;
  }

  return (
    <div>
      <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
        <h6 className="text-[20px] font-semibold text-[#352AA4] mb-4">Edit Perfume</h6>
        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
          <div className="flex gap-[20px] flex-col max-md:flex-wrap max-md:gap-[16px]">
            <div>
              <ImageUploader
                onImageSelect={onImageSelect}
                currentImage={form.image}
                error={imageError || formErrors.image}
                required={false} // Since existing image is acceptable
              />
            </div>
            <div className="flex gap-[16px] max-md:flex-wrap">
              <FormField
                label="Perfume Name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter here"
                error={touched.name && formErrors.name}
                required
              />
              <FormField
                label="Perfume Brand Name"
                name="brand"
                value={form.brand}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter here"
                error={touched.brand && formErrors.brand}
                required
              />
            </div>
          </div>

          <div className="flex gap-[16px] max-md:flex-wrap">
            <div className="w-full">
              <IntendedForMultiSelect
                value={form.intendedFor}
                onChange={handleIntendedForChange}
              />
              {formErrors.intendedFor && (
                <span className="text-red-500 text-xs mt-1">{formErrors.intendedFor}</span>
              )}
            </div>
            <div className="w-full">
              <FormField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter here"
                textAera="true"
                rows="6"
                error={touched.description && formErrors.description}
              />
              {formErrors.description && (
                <span className="text-red-500 text-xs mt-1">{formErrors.description}</span>
              )}
            </div>
          </div>

          <div className="flex gap-[16px] max-md:flex-wrap">
            <div className="w-full">
              <FormField
                label="Concentration"
                name="concentration"
                value={form.concentration}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter here"
                error={touched.concentration && formErrors.concentration}
              />
              {formErrors.concentration && (
                <span className="text-red-500 text-xs mt-1">{formErrors.concentration}</span>
              )}
            </div>
            <div className="w-full">
              <FormField
                label="Year Release"
                name="yearRelease"
                type="number"
                value={form.yearRelease}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min="1900"
                max={new Date().getFullYear()}
                placeholder="Enter here"
                error={touched.yearRelease && formErrors.yearRelease}
              />
              {formErrors.yearRelease && (
                <span className="text-red-500 text-xs mt-1">{formErrors.yearRelease}</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[20px] font-medium mt-4 mb-4">Occasion</h4>
            <div className="flex gap-[16px] max-md:flex-wrap">
              <FormField
                label="Occasion (Day Time)"
                name="occasionDay"
                type="number"
                min="0"
                max="100"
                value={form.occasionDay}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="0-100"
                error={touched.occasionDay && formErrors.occasionDay}
              />
              <FormField
                label="Occasion (Evening)"
                name="occasionEvening"
                type="number"
                min="0"
                max="100"
                value={form.occasionEvening}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="0-100"
                error={touched.occasionEvening && formErrors.occasionEvening}
              />
            </div>
            {formErrors.occasions && (
              <span className="text-red-500 text-xs mt-1">{formErrors.occasions}</span>
            )}
          </div>

          <SeasonFields
            form={form}
            onInputChange={handleInputChange}
            onBlur={handleBlur}
            formErrors={formErrors}
            touched={touched}
          />
          {formErrors.seasons && (
            <span className="text-red-500 text-xs mt-1">{formErrors.seasons}</span>
          )}

          {/* Perfumer Multi-Select */}
          <div className="flex flex-col">
            <label className="text-[#7C7C7C] text-[14px] mb-1">Perfumer</label>
            <Select
              isMulti
              options={perfumerOptions}
              value={perfumerIds}
              onChange={onPerfumerChange}
              placeholder="Select perfumers..."
              styles={getCustomStyles(formErrors.perfumers)}
              closeMenuOnSelect={false}
            />
            {formErrors.perfumers && (
              <span className="text-red-500 text-xs mt-1">{formErrors.perfumers}</span>
            )}
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
                  styles={getCustomStyles(formErrors.notes)}
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
                  styles={getCustomStyles(formErrors.notes)}
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
                  styles={getCustomStyles(formErrors.notes)}
                  closeMenuOnSelect={false}
                />
              </div>
              {fragranceNotes.length > 0 && (
                <div className="flex flex-col w-full">
                  <label className="text-[#7C7C7C] text-[14px] mb-1">Other Notes</label>
                  <Select
                    isMulti
                    options={noteOptions}
                    value={fragranceNotes}
                    onChange={onNoteNotesChange}
                    placeholder="Select other notes..."
                    styles={getCustomStyles(formErrors.notes)}
                    closeMenuOnSelect={false}
                  />
                </div>
              )}
            </div>
            {formErrors.notes && (
              <span className="text-red-500 text-xs mt-1">{formErrors.notes}</span>
            )}
          </div>

          <div>
            <AccordsList
              accords={mainAccords}
              onUpdate={handleAccordUpdate}
              onAdd={handleAddAccord}
              onRemove={handleRemoveAccord}
            />
            {formErrors.accords && (
              <span className="text-red-500 text-xs mt-1">{formErrors.accords}</span>
            )}
          </div>

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
