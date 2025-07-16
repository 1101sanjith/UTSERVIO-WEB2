'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { supabase } from '../../app/lib/supabaseClient';
import { serviceOptions } from '../../src/constants/services';
import { formatCurrency } from '../../src/helpers/formatCurrency';

interface Props { initialData?: any; onSave: (d: any) => void; onClose: () => void; }

export default function ServicePopup({ initialData = {}, onSave, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState({
    serviceName: initialData.service_name || '',
    customName: initialData.service_name || '',
    cost: initialData.cost || '',
    description: initialData.description || '',
    imageFile: null as File | null,
    imagePreview: initialData.image_url || '',
    isCustom: false,
    dropdown: false,
    dragging: false,
    loading: false,
    message: '',
    errors: {} as Record<string, string>,
  });

  useEffect(() => {
    const name = state.serviceName;
    const custom = name && !serviceOptions.flatMap(g => g.options).includes(name);
    setState(s => ({ ...s, isCustom: custom }));
  }, []);

  const update = (k: string, v: any) => setState(s => ({ ...s, [k]: v }));
  const finalName = () => (state.isCustom ? state.customName.trim() : state.serviceName);

  const validate = () => {
    const e: any = {};
    if (!finalName()) e.serviceName = 'Service name required';
    ['cost', 'description'].forEach(f => !state[f] && (e[f] = `${f} required`));
    if (!state.imageFile && !state.imagePreview) e.image = 'Image required';
    update('errors', e);
    return !Object.keys(e).length;
  };

  const handleFile = (file: File) => {
    update('imageFile', file);
    const reader = new FileReader();
    reader.onload = () => update('imagePreview', reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, uid: string) => {
    const ext = file.name.split('.').pop();
    const path = `service-images/${uid}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('service-images').upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from('service-images').getPublicUrl(path).data.publicUrl;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    update('loading', true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      let url = initialData.image_url || '';
      if (state.imageFile) url = await uploadImage(state.imageFile, user.id);
      const payload = { provider_id: user.id, service_name: finalName(), service_type: initialData.service_type || 'main', cost: state.cost, description: state.description, image_url: url };
      if (initialData.id) await supabase.from('services').update(payload).eq('id', initialData.id);
      else {
        const { data, error } = await supabase.from('services').insert(payload).select().single();
        if (error) throw error;
        await supabase.from('notifications').insert({ provider_id: user.id, message: `New service added: ${finalName()}` });
        onSave(data);
      }
      onClose();
    } catch (err: any) {
      update('message', err.message);
    } finally {
      update('loading', false);
    }
  };

  const dh = { onDragOver: (e: any) => (e.preventDefault(), update('dragging', true)), onDragLeave: (e: any) => (e.preventDefault(), update('dragging', false)), onDrop: (e: any) => (e.preventDefault(), handleFile(e.dataTransfer.files[0]), update('dragging', false)) };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 w-[90vw] md:w-[70vw] lg:max-w-2xl max-h-[90vh] overflow-y-auto relative">
      <X className="absolute top-2 right-2 w-7 h-7 cursor-pointer text-gray-500 hover:text-gray-700" onClick={onClose} />
      <div {...dh} onClick={() => fileRef.current?.click()} className={`mx-auto mb-4 border-2 border-dashed rounded-full cursor-pointer ${state.dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} ${state.imagePreview ? 'overflow-hidden' : 'flex items-center justify-center'} w-20 h-20`}>
        {state.imagePreview ? <img src={state.imagePreview} className="w-full h-full object-cover" /> : <ChevronDown className="text-gray-400 rotate-180" />}
        <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={e => e.target.files && handleFile(e.target.files[0])} />
      </div>
      {state.errors.image && <p className="text-red-500 text-sm text-center mb-2">{state.errors.image}</p>}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{initialData.id ? 'Edit Service' : 'Add New Service'}</h2>
        {state.message && <p className={`mt-2 text-sm text-center ${state.message.includes('saved') ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
      </div>
      <form onSubmit={submit} className="space-y-4">
        {/* Service Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Service Name</label>
          <div className="relative">
            <button type="button" onClick={() => update('dropdown', !state.dropdown)} className="w-full px-3 py-2 text-left border rounded-md bg-white flex justify-between items-center">
              <span>{finalName() || 'Select service'}</span>\<ChevronDown className="w-4 h-4"/>
            </button>
            {state.dropdown && <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto border rounded-md bg-white shadow-lg">{serviceOptions.map(g => (
              <div key={g.label} className="border-b last:border-0">
                <div className="px-3 py-2 text-xs font-medium bg-gray-50">{g.label}</div>
                <ul className="py-1">{g.options.map(o => (
                  <li key={o} onClick={() => (update('serviceName', o), update('isCustom', o==='Others'), update('dropdown', false))} className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">{o}</li>
                ))}</ul>
              </div>
            ))}</div>}
          </div>
          {state.isCustom && <input value={state.customName} onChange={e => update('customName', e.target.value)} placeholder="Custom service name" className="w-full px-3 py-2 border rounded-md" />}
          {state.errors.serviceName && <p className="text-red-500 text-sm">{state.errors.serviceName}</p>}
        </div>
        {/* Cost */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Service Cost</label>
          <div className="relative">
            <input type="text" value={state.cost} onChange={e => {
              const d = e.target.value.replace(/\D/g, '');
              if (!d) return update('cost', '');
              if (+d > 1e8) return;
              update('cost', d);
            }} placeholder="Enter cost" className="w-full px-3 py-2 pr-20 border rounded-md" />
            <span className="absolute right-3 top-2 text-sm">{formatCurrency(state.cost)}</span>
          </div>
          {state.errors.cost && <p className="text-red-500 text-sm">{state.errors.cost}</p>}
        </div>
        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea rows={4} value={state.description} onChange={e => update('description', e.target.value)} placeholder="Describe your service..." className="w-full px-3 py-2 border rounded-md resize-none" />
          {state.errors.description && <p className="text-red-500 text-sm">{state.errors.description}</p>}
        </div>
        <button type="submit" disabled={state.loading} className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {state.loading ? (initialData.id ? 'Updating…' : 'Creating…') : (initialData.id ? 'Update Service' : 'Save Service')}
        </button>
      </form>
    </div>
  );
}
