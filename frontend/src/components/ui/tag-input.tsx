import React, { useState, KeyboardEvent } from 'react';
import { Badge } from './badge';
import { Input } from './input';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = 'Add a tag...',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = value.filter((_, index) => index !== indexToRemove);
    onChange(newTags);
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag();
    }
  };

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]'>
        {value.map((tag, index) => (
          <Badge key={index} variant='secondary' className='flex items-center gap-1'>
            {tag}
            <button
              type='button'
              onClick={() => removeTag(index)}
              disabled={disabled}
              className='ml-1 hover:bg-gray-300 rounded-full p-0.5'
            >
              <X className='h-3 w-3' />
            </button>
          </Badge>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          className='flex-1 border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0'
        />
      </div>
      <p className='text-xs text-gray-500'>
        Press Enter or comma to add a tag. Press Backspace to remove the last tag.
      </p>
    </div>
  );
};
