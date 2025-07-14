'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { serviceOptions } from '../../src/constants/services';
import { formatCurrency } from '../../src/helpers/formatCurrency';

interface ServicePopupProps {
  initialData?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

export default function ServicePopup({ initialData, onSave, onClose }: ServicePopupProps) {
  // State
  const [serviceName, setServiceName] = useState(initialData?.service_name || '');
  const [customName, setCustomName] = useState(initialData?.service_name || '');
  const [isCustom, setIsCustom] = useState(false);
  const [cost, setCost] = useState(initialData?.cost || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image_url || '');
  const [isDragging, setIsDragging] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string,string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect if initial service name was custom
  useEffect(() => {
    if (initialData?.service_name) {
      const custom = !serviceOptions.some(g => g.options.includes(initialData.service_name));
      setIsCustom(custom);
      if (custom) setCustomName(initialData.service_name);
    }
  }, [initialData]);

  const getFinalServiceName = () => isCustom ? customName.trim() : serviceName;

  // Validation
  function validate() {
    const errs: Record<string,string> = {};
    if (!getFinalServiceName()) errs.serviceName = 'Service name required';
    if (!cost) errs.cost = 'Cost required';
    if (!description) errs.description = 'Description required';
    if (!(imageFile || imagePreview)) errs.image = 'Image required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Preview image
  const handleFile = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Supabase upload
  async function uploadImage(file: File, userId: string) {
    const ext = file.name.split('.').pop();
    const path = `service-images/${userId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('service-images')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('service-images').getPublicUrl(path);
    return data.publicUrl;
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMessage('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      let imageUrl = initialData?.image_url || '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, user.id);
      }

      const payload = {
        provider_id: user.id,
        service_name: getFinalServiceName(),
        service_type: initialData?.service_type || 'main',
        cost,
        description,
        image_url: imageUrl,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('services')
          .update(payload)
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('services')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        await supabase.from('notifications').insert({
          provider_id: user.id,
          message: `New service added: ${getFinalServiceName()}`,
        });
        onSave(data);
      }

      setMessage('Service saved!');
      onClose();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Drag & drop handlers
  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); },
    onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      handleFile(e.dataTransfer.files[0]);
      setIsDragging(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6
                    w-[90vw] md:w-[70vw] lg:max-w-2xl
                    max-h-[90vh] overflow-y-auto
                    relative">
      {/* Close Button */}
      <X
        className="absolute top-2 right-2 sm:top-4 sm:right-4 w-6 h-6 sm:w-7 sm:h-7
                   cursor-pointer text-gray-500 hover:text-gray-700"
        onClick={onClose}
      />

      {/* Image Drag & Drop */}
      <div
        {...dragHandlers}
        onClick={() => fileInputRef.current?.click()}
        className={`
          w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 border-2 border-dashed rounded-full cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${imagePreview ? 'overflow-hidden' : 'flex items-center justify-center'}
        `}
      >
        {imagePreview
          ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          : <ChevronDown className="text-gray-400 rotate-180" />}
        <input
          type="file"
          ref={fileInputRef}
          onChange={e => e.target.files && handleFile(e.target.files[0])}
          accept="image/*"
          className="hidden"
        />
      </div>
      {errors.image && <p className="text-red-500 text-sm text-center mb-2">{errors.image}</p>}

      {/* Title & Message */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'Edit Service' : 'Add New Service'}
        </h2>
        {message && (
          <p className={`mt-2 text-sm text-center
            ${message.includes('saved') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Service Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Service Name</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(o => !o)}
              className="w-full px-3 py-2 text-left border rounded-md bg-white flex justify-between items-center"
            >
              <span>{getFinalServiceName() || 'Select service'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto border rounded-md bg-white shadow-lg">
                {serviceOptions.map(group => (
                  <div key={group.label} className="border-b last:border-0">
                    <div className="px-3 py-2 text-xs font-medium bg-gray-50">
                      {group.label}
                    </div>
                    <ul className="py-1">
                      {group.options.map(option => (
                        <li
                          key={option}
                          onClick={() => {
                            setServiceName(option);
                            setIsCustom(option === 'Others');
                            setDropdownOpen(false);
                          }}
                          className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
          {isCustom && (
            <input
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder="Custom service name"
              className="w-full px-3 py-2 border rounded-md"
            />
          )}
          {errors.serviceName && <p className="text-red-500 text-sm">{errors.serviceName}</p>}
        </div>

        {/* Cost with dynamic formatted display */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Service Cost</label>
          <div className="relative">
            <input
              type="text"
              value={cost}
              onChange={e => {
                // strip non-digits, cap <= 100,000,000
                const digits = e.target.value.replace(/\D/g, '');
                if (!digits) return setCost('');
                if (Number(digits) > 100000000) return;
                setCost(digits);
              }}
              className="w-full px-3 py-2 pr-20 border rounded-md appearance-none focus:outline-none"
              placeholder="Enter cost"
            />
            <span className="absolute right-3 top-2 text-sm">
              {formatCurrency(cost)}
            </span>
          </div>
          {errors.cost && <p className="text-red-500 text-sm">{errors.cost}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-md resize-none"
            placeholder="Describe your service..."
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading
            ? (initialData ? 'Updating…' : 'Creating…')
            : (initialData ? 'Update Service' : 'Save Service')}
        </button>
      </form>
    </div>
  );
}
