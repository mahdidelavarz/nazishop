'use client';

import { useState, KeyboardEvent } from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { ProductFormData } from './ProductFormSchema';

interface ProductTagsProps {
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
}

export function ProductTags({ watch, setValue }: ProductTagsProps) {
  const [inputValue, setInputValue] = useState('');
  const tags = watch('tags') || [];

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setValue('tags', [...tags, trimmedTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Suggested tags for cosmetics store
  const suggestedTags = [
    'آرایشی',
    'بهداشتی',
    'مراقبت پوست',
    'ضد آفتاب',
    'ارگانیک',
    'ضد چروک',
    'مرطوب‌کننده',
    'پاک‌کننده',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Icon icon="solar:tag-horizontal-bold-duotone" className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">برچسب‌ها</h2>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Tags Input */}
        <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-[56px]">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? 'برچسب‌ها را وارد کنید...' : ''}
            className="flex-1 min-w-[120px] outline-none bg-transparent"
          />
        </div>
        <p className="text-xs text-gray-500">
          برای افزودن برچسب، Enter یا کاما بزنید
        </p>

        {/* Suggested Tags */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">پیشنهادی:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTags
              .filter((tag) => !tags.includes(tag))
              .map((tag, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  + {tag}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

