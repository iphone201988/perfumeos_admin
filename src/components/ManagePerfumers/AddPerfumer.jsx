import React, { useState, useEffect } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import addpic_icon from '../../assets/icons/addpic-icon.svg'

const AddPerfumer = ({ open, onClose, onSubmit, initialData = null }) => {
  // State for all form fields based on PerfumersModel
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  // Handle initialData (on edit)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setDescription(initialData.description || '')

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
      setDescription('')
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
      alert('Please enter a Perfumer name')
      return
    }
    if (!description.trim()) {
      alert('Please enter an description')
      return
    }

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('description', description.trim())

    if (image instanceof File) {
      formData.append('bigImage', image)
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
            {initialData ? 'Edit Perfumer' : 'Add Perfumer'}
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
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Perfumer Name *</span>
            <input
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              type="text"
              placeholder='Enter Perfumer name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Description</span>
            <input
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              type="text"
              placeholder='Enter description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
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
            {initialData ? 'Update Perfumer' : 'Create Perfumer'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddPerfumer
