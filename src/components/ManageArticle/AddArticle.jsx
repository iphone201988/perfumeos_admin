import React, { useState, useEffect } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import addpic_icon from '../../assets/icons/addpic-icon.svg'

const AddArticle = ({ open, onClose, onSubmit, initialData = null }) => {
  // State for form fields
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  // Handle initialData (on edit)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setContent(initialData.content || '')
      setImage(initialData.image || null)
      setPreview(initialData.image || null)
    } else {
      setTitle('')
      setContent('')
      setImage(null)
      setPreview(null)
    }
  }, [initialData, open])

  // Image Preview Handler
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
    if (title.trim() === '' || content.trim() === '') return
    // Collect the article data
    const data = {
      title,
      content,
      image,
    }
    onSubmit(data)
    // Optionally reset fields after
    setTitle('')
    setContent('')
    setImage(null)
    setPreview(null)
    onClose()
  }

  // Auto-close modal if not open
  if (!open) return null

  return (
    <div className='w-full p-[20px]  min-h-[100vh] fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center max-md:p-[20px]'>
      <form
        onSubmit={handleSubmit}
        className="bg-[#fff] p-[32px] h-full rounded-[24px] max-w-[600px] w-full max-md:p-[16px] max-md:overflow-scroll max-md:h-[600px]"
        autoComplete="off"
      >
        <div className="flex items-center justify-between">
          <h5 className='text-[20px] text-[#352AA4] font-semibold'>
            {initialData ? 'Edit Article' : 'Add Article'}
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

        <div className="mt-[20px] flex flex-col gap-[16px]">
          <label className="flex justify-center items-center border border-[#EFEFEF] rounded-2xl p-[16px] h-[210px] cursor-pointer">
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
              <p className='text-[#666666]'>
                {preview ? 'Change Pic' : 'Add Perfum Pic'}
              </p>
            </div>
          </label>

          <div className="flex gap-[12px] max-md:flex-wrap">
            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px]'>Article title</span>
              <input
                className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
                type="text"
                placeholder='Enter here'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="flex gap-[12px] max-md:flex-wrap">
            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px]'>Content</span>
              <textarea
                className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] h-[220px]'
                placeholder='Enter here'
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </label>
          </div>
        </div>

        <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
          <button className='btn-pri' type="submit">
            {initialData ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddArticle
