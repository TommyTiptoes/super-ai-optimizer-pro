import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

export default function MultiSelect({ options, selected, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const removeItem = (value) => {
    onChange(selected.filter(item => item !== value));
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[40px] p-3 bg-gray-800 border border-gray-700 rounded-md cursor-pointer flex flex-wrap items-center gap-2"
      >
        {selected.length === 0 && (
          <span className="text-gray-400">Select countries...</span>
        )}
        {selected.map(value => {
          const option = options.find(opt => opt.value === value);
          return (
            <Badge key={value} className="bg-purple-600 text-white flex items-center gap-1">
              {option?.label || value}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-gray-300" 
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(value);
                }}
              />
            </Badge>
          );
        })}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
          {options.map(option => (
            <div
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className="p-3 hover:bg-gray-700 cursor-pointer flex items-center justify-between text-white"
            >
              <span>{option.label}</span>
              {selected.includes(option.value) && (
                <Check className="w-4 h-4 text-purple-400" />
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}