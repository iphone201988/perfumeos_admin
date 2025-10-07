import React, { useState, useEffect } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import addpic_icon from '../../assets/icons/addpic-icon.svg'

const AddRanks = ({ open, onClose, onSubmit, initialData = null }) => {
  // State for all form fields based on RanksModel
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [otherImage, setOtherImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [otherPreview, setOtherPreview] = useState(null)
  const [imageWithoutLabel, setImageWithoutLabel] = useState(null)
  const [otherImageWithoutLabel, setOtherImageWithoutLabel] = useState(null)
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')

  // Handle initialData (on edit)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setDescription(initialData.description || '')
      setMin(initialData.min?.toString() || '')
      setMax(initialData.max?.toString() || '')
      
      // Handle existing images
      if (initialData.image) {
        const imageUrl = initialData.image.startsWith('http')
          ? initialData.image
          : `${import.meta.env.VITE_BASE_URL}${initialData.image}`;
        setPreview(imageUrl);
      }

      if (initialData.otherImage) {
        const otherImageUrl = initialData.otherImage.startsWith('http')
          ? initialData.otherImage
          : `${import.meta.env.VITE_BASE_URL}${initialData.otherImage}`;
        setOtherPreview(otherImageUrl);
      }

      if(initialData.imageWithoutLabel) {
        const imageUrl = initialData.imageWithoutLabel.startsWith('http')
          ? initialData.imageWithoutLabel
          : `${import.meta.env.VITE_BASE_URL}${initialData.imageWithoutLabel}`;
        setOtherImageWithoutLabel(imageUrl);
      }
    } else {
      // Reset all fields
      setName('')
      setDescription('')
      setImage(null)
      setOtherImage(null)
      setPreview(null)
      setOtherPreview(null)
      setImageWithoutLabel(null)
      setOtherImageWithoutLabel(null)
      setMin('')
      setMax('')
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
      if (otherPreview && otherPreview.startsWith('blob:')) {
        URL.revokeObjectURL(otherPreview);
      }
      if (otherImageWithoutLabel && otherImageWithoutLabel.startsWith('blob:')) {
        URL.revokeObjectURL(otherImageWithoutLabel);
      }
    };
  }, [preview, otherPreview, otherImageWithoutLabel ]);

  // Image Preview Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleOtherImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setOtherImage(file)
      setOtherPreview(URL.createObjectURL(file))
    }
  }

  const handleImageWithoutLabelChange = (e) => {
    console.log(e.target.files[0])
    const file = e.target.files[0]
    if (file) {
      setImageWithoutLabel(file)
      setOtherImageWithoutLabel(URL.createObjectURL(file))
    }
  }

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!name.trim()) {
      toast.warning('Please enter a rank name')
      return
    }
    if (!min || !max) {
      toast.warning('Please enter both min and max values')
      return
    }
    if (parseInt(min) >= parseInt(max)) {
      toast.warning('Min value must be less than max value')
      return
    }

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('description', description.trim())
    formData.append('min', parseInt(min))
    formData.append('max', parseInt(max))

    if (image instanceof File) {
      formData.append('image', image)
    }
    if (otherImage instanceof File) {
      formData.append('otherImage', otherImage)
    }

    if (imageWithoutLabel instanceof File) {
      formData.append('imageWithoutLabel', imageWithoutLabel)
    }

    console.log('Submitting rank data:', {
      name,
      description,
      min: parseInt(min),
      max: parseInt(max),
      hasImage: !!image,
      hasOtherImage: !!otherImage
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
            {initialData ? 'Edit Rank' : 'Add Rank'}
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

            <label className="flex justify-center items-center border border-[#EFEFEF] rounded-2xl p-4 h-[210px] cursor-pointer flex-1">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleOtherImageChange}
              />
              <div className="flex flex-col justify-center items-center">
                {otherPreview ? (
                  <img
                    src={otherPreview}
                    alt="Other Preview"
                    className="max-h-[150px] mb-[10px] rounded-xl object-contain"
                  />
                ) : (
                  <img src={addpic_icon} alt="" />
                )}
                <p className='text-[#666666] text-center text-sm'>
                  {otherPreview ? 'Change Alt Image' : 'Add Alternative Image'}
                </p>
              </div>
            </label>
            <label className="flex justify-center items-center border border-[#EFEFEF] rounded-2xl p-4 h-[210px] cursor-pointer flex-1">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageWithoutLabelChange}
              />
              <div className="flex flex-col justify-center items-center">
                {otherImageWithoutLabel ? (
                  <img
                    src={otherImageWithoutLabel}
                    alt="Image Without Label"
                    className="max-h-[150px] mb-[10px] rounded-xl object-contain"
                  />
                ) : (
                  <img src={addpic_icon} alt="" />
                )}
                <p className='text-[#666666] text-center text-sm'>
                  {otherImageWithoutLabel ? 'Change Image Without Label' : 'Add Image Without Label'}
                </p>
              </div>
            </label>
          </div>

          {/* Form Fields */}
          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Rank Name *</span>
            <input
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              type="text"
              placeholder='Enter rank name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Description</span>
            <textarea
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] min-h-[100px] resize-none'
              placeholder='Enter rank description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          {/* Min/Max Values */}
          <div className="grid grid-cols-2 gap-4">
            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px] mb-1'>Min Value *</span>
              <input
                className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
                type="number"
                placeholder='0'
                value={min}
                onChange={(e) => setMin(e.target.value)}
                required
                min="0"
              />
            </label>

            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px] mb-1'>Max Value *</span>
              <input
                className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
                type="number"
                placeholder='100'
                value={max}
                onChange={(e) => setMax(e.target.value)}
                required
                min="1"
              />
            </label>
          </div>

          {/* Range Preview */}
          {min && max && parseInt(min) < parseInt(max) && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">Range Preview:</span>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 px-3 py-1 rounded-lg">
                    <span className="text-blue-800 font-semibold text-sm">Min: {min}</span>
                  </div>
                  <div className="text-blue-400">—</div>
                  <div className="bg-green-100 px-3 py-1 rounded-lg">
                    <span className="text-green-800 font-semibold text-sm">Max: {max}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Users with scores between {min} and {max} will receive this rank
              </p>
            </div>
          )}

          {/* Validation Warning */}
          {min && max && parseInt(min) >= parseInt(max) && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700 font-medium">Invalid Range</span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                Min value must be less than max value
              </p>
            </div>
          )}
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
            disabled={min && max && parseInt(min) >= parseInt(max)}
          >
            {initialData ? 'Update Rank' : 'Create Rank'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddRanks
