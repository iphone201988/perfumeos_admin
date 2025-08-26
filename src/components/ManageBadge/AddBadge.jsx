import React, { useState, useEffect } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import addpic_icon from '../../assets/icons/addpic-icon.svg'

const AddBadge = ({ open, onClose, onSubmit, initialData = null }) => {
  // State for all form fields
  const [name, setName] = useState('')
  const [image, setImage] = useState(null)
  const [otherImage, setOtherImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [blackWhitePreview, setBlackWhitePreview] = useState(null)
  const [category, setCategory] = useState('')
  const [isOneTimeOnly, setIsOneTimeOnly] = useState(false)
  const [isRepeatable, setIsRepeatable] = useState(false)
  const [repeatLimit, setRepeatLimit] = useState('')
  const [note, setNote] = useState('')
  const [unlockCondition, setUnlockCondition] = useState('')
  const [rarity, setRarity] = useState('')
  const [pointEarned, setPointEarned] = useState('')
  const [requiredCount, setRequiredCount] = useState('')

  // Handle initialData (on edit)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      if (initialData.image) {
        const imageUrl = initialData.image.startsWith('http')
          ? initialData.image
          : `${import.meta.env.VITE_BASE_URL}${initialData.image}`;
        setPreview(imageUrl);
        // Don't set the file object for existing images
      }

      if (initialData.otherImage) {
        const otherImageUrl = initialData.otherImage.startsWith('http')
          ? initialData.otherImage
          : `${import.meta.env.VITE_BASE_URL}${initialData.otherImage}`;
        setBlackWhitePreview(otherImageUrl);
      }
      setPreview(initialData.image || null)
      setBlackWhitePreview(initialData.otherImage || null)
      setCategory(initialData.category || '')
      setIsOneTimeOnly(initialData.isOneTimeOnly || false)
      setIsRepeatable(initialData.isRepeatable || false)
      setRepeatLimit(initialData.repeatLimit || '')
      setNote(initialData.note || '')
      setUnlockCondition(initialData.unlockCondition || '')
      setRarity(initialData.rarity || '')
      setPointEarned(initialData.pointEarned || '')
      setRequiredCount(initialData.requiredCount || '')
    } else {
      // Reset all fields
      setName('')
      setImage(null)
      setOtherImage(null)
      setPreview(null)
      setBlackWhitePreview(null)
      setCategory('')
      setIsOneTimeOnly(false)
      setIsRepeatable(false)
      setRepeatLimit('')
      setNote('')
      setUnlockCondition('')
      setRarity('')
      setPointEarned('')
      setRequiredCount('')
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
  useEffect(() => {
    // Cleanup function to revoke object URLs
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      if (blackWhitePreview && blackWhitePreview.startsWith('blob:')) {
        URL.revokeObjectURL(blackWhitePreview);
      }
    };
  }, [preview, blackWhitePreview]);

  // Image Preview Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleBlackWhiteImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setOtherImage(file)
      setBlackWhitePreview(URL.createObjectURL(file))
    }
  }

  // Form Submit Handler
  const handleSubmit = (e) => {
    console.log('submit')
    e.preventDefault()
    if (name.trim() === '') return

    // Collect all badge data
    const data = {
      name,
      category,
      isOneTimeOnly,
      isRepeatable,
      repeatLimit: repeatLimit ? parseInt(repeatLimit) : null,
      note,
      unlockCondition,
      rarity: rarity ? parseInt(rarity) : 1,
      pointEarned: pointEarned ? parseInt(pointEarned) : null,
      requiredCount: requiredCount ? parseInt(requiredCount) : null,
    }

    if (image instanceof File) data.image = image;
    if (otherImage instanceof File) data.otherImage = otherImage;
    console.log("data", data)
    onSubmit(data)
    onClose()
  }

  // Auto-close modal if not open
  if (!open) return null
  console.log("image", image)
  return (
    <div className='w-full min-h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center p-4'>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[24px] max-w-[600px] w-full max-h-[90vh] overflow-y-auto p-8 max-md:p-4 max-md:max-h-[95vh]"
        autoComplete="off"
      >
        <div className="flex items-center justify-between mb-6">
          <h5 className='text-[20px] text-[#352AA4] font-semibold'>
            {initialData ? 'Edit Badge' : 'Add Badge'}
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
                  {preview ? 'Change Pic' : 'Add Badge Pic'}
                </p>
              </div>
            </label>

            <label className="flex justify-center items-center border border-[#EFEFEF] rounded-2xl p-4 h-[210px] cursor-pointer flex-1">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBlackWhiteImageChange}
              />
              <div className="flex flex-col justify-center items-center">
                {blackWhitePreview ? (
                  <img
                    src={blackWhitePreview}
                    alt="Black-white Preview"
                    className="max-h-[150px] mb-[10px] rounded-xl object-contain"
                  />
                ) : (
                  <img src={addpic_icon} alt="" />
                )}
                <p className='text-[#666666] text-center text-sm'>
                  {blackWhitePreview ? 'Change B&W Pic' : 'Add Black-white Badge Pic'}
                </p>
              </div>
            </label>
          </div>

          {/* Form Fields */}
          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Badge Name</span>
            <input
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              type="text"
              placeholder='Enter here'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Category</span>
            <select
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="quiz">Quiz</option>
              <option value="wishlist">Wishlist</option>
              <option value="collection">Collection</option>
              <option value="review">Review</option>
              <option value="streak">Streak</option>
              <option value="login">Login</option>
              <option value="scan">Scan</option>
            </select>
          </label>

          <div className="flex gap-6 flex-wrap">
            <label className='flex items-center gap-2'>
              <input
                type="checkbox"
                checked={isOneTimeOnly}
                onChange={(e) => setIsOneTimeOnly(e.target.checked)}
                className="rounded"
              />
              <span className='text-[#7C7C7C] text-[14px]'>One Time Only</span>
            </label>

            <label className='flex items-center gap-2'>
              <input
                type="checkbox"
                checked={isRepeatable}
                onChange={(e) => setIsRepeatable(e.target.checked)}
                className="rounded"
              />
              <span className='text-[#7C7C7C] text-[14px]'>Is Repeatable</span>
            </label>
          </div>
          {isRepeatable && (


            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px] mb-1'>Repeat Limit</span>
              <select
                className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
                value={repeatLimit}
                onChange={(e) => setRepeatLimit(e.target.value)}
                required={isRepeatable}
              >
                <option value="">Select repeat limit</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          )}

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Note</span>
            <input
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              type="text"
              placeholder='Enter here'
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Unlock Condition</span>
            <input
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              type="text"
              placeholder='Enter here'
              value={unlockCondition}
              onChange={(e) => setUnlockCondition(e.target.value)}
              required
            />
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Rarity</span>
            <select
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              value={rarity}
              onChange={(e) => setRarity(e.target.value)}
              required
            >
              <option value="">Select Rarity</option>
              <option value="1">Common</option>
              <option value="2">Un common</option>
              <option value="3">Rare</option>
            </select>
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Point Earned</span>
            <input
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              type="number"
              placeholder='Enter here'
              value={pointEarned}
              onChange={(e) => setPointEarned(e.target.value)}
              required
            />
          </label>

          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px] mb-1'>Required Count</span>
            <input
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              type="number"
              placeholder='Enter here'
              value={requiredCount}
              onChange={(e) => setRequiredCount(e.target.value)}
              required
            />
          </label>


        </div>
        <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
          <button
            onClick={onClose}
            className="text-gray-500 bg-white border-2 rounded-full border-gray-500 hover:bg-gray-500 hover:text-white font-semibold py-2 px-4 transition-colors duration-300"
          >
            Close
          </button>
          <button className='btn-pri' type="submit">
            {initialData ? 'Save' : 'Add'}
          </button>

        </div >
      </form >
    </div >
  )
}

export default AddBadge
