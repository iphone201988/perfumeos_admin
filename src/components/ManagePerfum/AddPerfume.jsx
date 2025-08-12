import React, { useCallback, useState } from "react";
import { useCreatePerFumeMutation, useGetNotesQuery, useGetPerfumersQuery } from "../../api";
import ImageUploader from "../Form/ImageUploader";
import FormField from "../Form/FormField";
import { useNavigate } from "react-router-dom";
import IntendedForMultiSelect from "../Form/IntendedForMultiSelect";
import SeasonFields from "../Form/SeasonFields";
import AccordsList from "./Accords/AccordsList";
import { hexToRgb, rgbToHex } from "../../Utils/function";
import Select from 'react-select';
import Loader from "../Loader/Loader";

const AddPerfume = () => {
    const navigate = useNavigate();

    const { data: notesResponse, isLoading: notesLoading } = useGetNotesQuery();
    const { data: perfumersResponse, isLoading: perfumersLoading } = useGetPerfumersQuery();
    const [createPerfume] = useCreatePerFumeMutation();
    const [creating, setCreating] = useState(false);

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

    const [file, setFile] = useState(null);
    const [mainAccords, setMainAccords] = useState([]);
    const [perfumerIds, setPerfumerIds] = useState([]);
    const [fragranceTop, setFragranceTop] = useState([]);
    const [fragranceMiddle, setFragranceMiddle] = useState([]);
    const [fragranceBottom, setFragranceBottom] = useState([]);
    const [fragranceNotes, setFragranceNotes] = useState([]);

    // Convert data to react-select format
    const noteOptions = React.useMemo(() => {
        if (!notesResponse?.data) return [];
        return notesResponse.data.map((note) => ({
            value: note._id,
            label: note.name,
        }));
    }, [notesResponse?.data]);

    const perfumerOptions = React.useMemo(() => {
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
        console.log(idx, field, value)
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
        setMainAccords((prev,index) => [
            ...prev,
            {
                name: "",
                width: 50,
                backgroundColor: "#000000",
                id: index,
            },
        ]);
    }, []);

    const handleRemoveAccord = useCallback((idx) => {
        setMainAccords((prev) => prev.filter((_, i) => i !== idx));
    }, []);

    const resetForm = useCallback(() => {
        setForm({
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
        setMainAccords([]);
        setPerfumerIds([]);
        setFragranceTop([]);
        setFragranceMiddle([]);
        setFragranceBottom([]);
        setFragranceNotes([]);
        setFile(null);
    }, []);

    // FIXED: Added e parameter, useCallback wrapper, and correct variable name
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
            width: accord.width? `${accord.width}%` : '0%',
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
            setCreating(true);
            await createPerfume(formData).unwrap(); // Changed from newPerfumeData to formData
            alert("Perfume created successfully!");
            navigate("/perfumes");
            resetForm();
        } catch (err) {
            console.error("Create error:", err);
            alert("Failed to create perfume: " + (err?.data?.message || err.message));
        } finally {
            setCreating(false);
        }
    }, [form, file, perfumerIds, fragranceTop, fragranceMiddle, fragranceBottom, fragranceNotes, mainAccords, createPerfume, navigate, resetForm]);

    // Custom styles for react-select
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

    if (notesLoading || perfumersLoading) {
        return <Loader message="Adding some data" />;
    }

    return (
        <div>
            <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
                <h6 className="text-[20px] font-semibold text-[#352AA4] mb-4">Add New Perfume</h6>
                <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
                    <div className="flex gap-[20px] flex-col max-md:flex-wrap max-md:gap-[16px]">
                        <ImageUploader onImageSelect={onImageSelect} currentImage={form.image} />
                        <div className="flex gap-[20px] max-md:flex-wrap max-md:gap-[16px]">
                            <FormField
                            label="Perfume Name"
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            placeholder="Enter perfume name"
                            required
                        />
                        <FormField
                            label="Perfume Brand Name"
                            name="brand"
                            value={form.brand}
                            onChange={handleInputChange}
                            placeholder="Enter brand name"
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
                            placeholder="Enter perfume description"
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
                            placeholder="e.g., Eau de Parfum, Eau de Toilette"
                        />
                        <FormField
                            label="Year Release"
                            name="yearRelease"
                            type="number"
                            value={form.yearRelease}
                            onChange={handleInputChange}
                            min="1900"
                            max={new Date().getFullYear()}
                            placeholder="Enter release year"
                        />
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
                                placeholder="0-100"
                            />
                            <FormField
                                label="Occasion (Evening)"
                                name="occasionEvening"
                                type="number"
                                min="0"
                                max="100"
                                value={form.occasionEvening}
                                onChange={handleInputChange}
                                placeholder="0-100"
                            />
                        </div>
                    </div>

                    <SeasonFields form={form} onInputChange={handleInputChange} />

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

                        <div className="flex gap-[16px] max-md:flex-wrap max-lg:flex-wrap mt-4">
                            <div className="flex flex-col w-full">
                                <label className="text-[#7C7C7C] text-[14px] mb-1">Base Notes</label>
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
                        </div>
                    </div>

                    <AccordsList
                        accords={mainAccords}
                        onUpdate={handleAccordUpdate}
                        onAdd={handleAddAccord}
                        onRemove={handleRemoveAccord}
                    />

                    <div className="flex justify-end gap-[16px] mt-[24px] pt-4 border-t max-md:flex-wrap">
                        <button
                            type="button"
                            className="btn-sec px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={resetForm}
                        >
                            Reset Form
                        </button>
                        <button
                            type="button"
                            className="btn-sec px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-pri px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={creating}
                        >
                            {creating ? "Creating..." : "Create Perfume"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPerfume;
