import React, { useState, useEffect } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import addpic_icon from '../../assets/icons/addpic-icon.svg'

const AddNote = ({ open, onClose, onSubmit, initialData = null }) => {
  // State for all form fields based on NotesModel
  const [name, setName] = useState('')
  const [odorProfile, setOdorProfile] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [group, setGroup] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [otherNames, setOtherNames] = useState(['']) // Add this state

  // Handle initialData (on edit)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setOdorProfile(initialData.odorProfile || '')
      setGroup(initialData.group || '')
      setScientificName(initialData.scientificName || '')

      // Handle otherNames array
      setOtherNames(initialData.otherNames && initialData.otherNames.length > 0 ? initialData.otherNames : [''])

      // Handle existing images
      if (initialData.image) {
        const imageUrl = initialData.image.startsWith('http')
          ? initialData.image
          : `${import.meta.env.VITE_BASE_URL}${initialData.image}`;
        setPreview(imageUrl);
      }
    } else {
      // Reset all fields
      setName('')
      setImage(null)
      setPreview(null)
      setOdorProfile('')
      setGroup('')
      setScientificName('')
      setOtherNames(['']) // Reset to single empty field
    }
  }, [initialData, open])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to restore body scroll
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Other Names handlers
  const handleOtherNameChange = (index, value) => {
    const updatedNames = [...otherNames]
    updatedNames[index] = value
    setOtherNames(updatedNames)
  }

  const addOtherNameField = () => {
    setOtherNames([...otherNames, ''])
  }

  const removeOtherNameField = (index) => {
    if (otherNames.length > 1) {
      const updatedNames = otherNames.filter((_, i) => i !== index)
      setOtherNames(updatedNames)
    }
  }

  // Image Preview Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!name.trim()) {
      alert('Please enter a Note name')
      return
    }
    if (!odorProfile.trim()) {
      alert('Please enter an odor profile')
      return
    }
    if (!group.trim()) {
      alert('Please enter a group')
      return
    }
    if (!scientificName.trim()) {
      alert('Please enter a scientific name')
      return
    }

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('odorProfile', odorProfile.trim())
    formData.append('group', group.trim())
    formData.append('scientificName', scientificName.trim())

    // Add otherNames array - filter out empty values
    const validOtherNames = otherNames.filter(name => name.trim() !== '')
    if (validOtherNames.length > 0) {
      formData.append('otherNames', JSON.stringify(validOtherNames))
    }

    if (image instanceof File) {
      formData.append('image', image)
    }
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`)
    })
    onSubmit(formData)
    onClose()
  }

  // Auto-close modal if not open
  if (!open) return null

  return (
    <div className='w-full min-h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center p-4'>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[24px] max-w-[600px] w-full max-h-[90vh] overflow-y-auto p-8 max-md:p-4 max-md:max-h-[95vh]"
        autoComplete="off"
      >
        <div className="flex items-center justify-between mb-6">
          <h5 className='text-[20px] text-[#352AA4] font-semibold'>
            {initialData ? 'Edit Note' : 'Add Note'}
          </h5>
          <button
            type="button"
            className='cursor-pointer'
            onClick={onClose}
            aria-label="Close"
          >
            <img src={cross_icon} alt="Close" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Image Upload Sections */}
          <div className="flex gap-3 max-md:flex-col">
            <label className="flex justify-center items-center border border-[#EFEFEF] rounded-2xl p-4 h-[210px] cursor-pointer flex-1">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <div className="flex flex-col justify-center items-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-[150px] mb-[10px] rounded-xl object-contain"
                  />
                ) : (
                  <img src={addpic_icon} alt="" />
                )}
                <p className='text-[#666666] text-center text-sm'>
                  {preview ? 'Change Image' : 'Add Main Image'}
                </p>
              </div>
            </label>
          </div>

          {/* Form Fields */}
          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Note Name *</span>
            <input
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              type="text"
              placeholder='Enter Note name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          {/* Other Names Dynamic Fields - Auto-sizing Grid */}
          <div className='flex flex-col w-full'>
            <div className="flex items-center justify-between mb-2">
              <span className='text-[#7C7C7C] text-[14px]'>Other Names</span>
              <button
                type="button"
                onClick={addOtherNameField}
                className="text-[#352AA4] hover:text-[#2a1f7a] text-sm font-medium transition-colors duration-300"
              >
                + Add Name
              </button>
            </div>

            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {otherNames.map((otherName, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    className='border border-[#EEEEEE] rounded-2xl py-[12px] px-[16px] flex-1 text-sm'
                    type="text"
                    placeholder={`Enter name ${index + 1}`}
                    value={otherName}
                    onChange={(e) => handleOtherNameChange(index, e.target.value)}
                  />
                  {otherNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOtherNameField(index)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg px-1 transition-colors duration-300 flex-shrink-0"
                      aria-label="Remove field"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Scientific Name</span>
            <input
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              type="text"
              placeholder='Enter Scientific name'
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
              required
            />
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Group</span>
            <input
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              type="text"
              placeholder='Enter Group name'
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              required
            />
          </label>



          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Odor Profile</span>
            <textarea
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] min-h-[100px] resize-none'
              placeholder='Enter Odor Profile'
              value={odorProfile}
              onChange={(e) => setOdorProfile(e.target.value)}
            />
          </label>
        </div>

        <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 bg-white border-2 rounded-full border-gray-500 hover:bg-gray-500 hover:text-white font-semibold py-2 px-4 transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            className='bg-[#352AA4] hover:bg-[#2a1f7a] text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300'
            type="submit"
          >
            {initialData ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddNote
