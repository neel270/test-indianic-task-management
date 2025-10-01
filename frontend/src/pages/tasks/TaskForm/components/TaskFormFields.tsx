import React from 'react';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { TagInput } from '../../../../components/ui/tag-input';
import { AttachmentUpload } from '../../../../components/ui/attachment-upload';

interface TaskFormFieldsProps {
  formik: any;
  isLoading: boolean;
}

export const TaskFormFields: React.FC<TaskFormFieldsProps> = ({
  formik,
  isLoading,
}) => {
  console.log('TaskFormFields - formik values:', formik.values);
  return (
    <>
      {/* Title */}
      <div className='space-y-2'>
        <Label htmlFor='title'>Title *</Label>
        <Input
          id='title'
          name='title'
          placeholder='Enter task title'
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={formik.touched.title && formik.errors.title ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {formik.touched.title && formik.errors.title && (
          <p className='text-sm text-red-500'>{formik.errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className='space-y-2'>
        <Label htmlFor='description'>Description *</Label>
        <Textarea
          id='description'
          name='description'
          placeholder='Enter task description'
          rows={4}
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={
            formik.touched.description && formik.errors.description ? 'border-red-500' : ''
          }
          disabled={isLoading}
        />
        {formik.touched.description && formik.errors.description && (
          <p className='text-sm text-red-500'>{formik.errors.description}</p>
        )}
      </div>

      {/* Status and Priority */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='status'>Status *</Label>
          <Select
            value={formik.values.status}
            onValueChange={value => void formik.setFieldValue('status', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Pending'>Pending</SelectItem>
              <SelectItem value='In Progress'>In Progress</SelectItem>
              <SelectItem value='Completed'>Completed</SelectItem>
              <SelectItem value='Cancelled'>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='priority'>Priority *</Label>
          <Select
            value={formik.values.priority}
            onValueChange={value => void formik.setFieldValue('priority', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select priority' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Low'>Low</SelectItem>
              <SelectItem value='Medium'>Medium</SelectItem>
              <SelectItem value='High'>High</SelectItem>
              <SelectItem value='Urgent'>Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Due Date */}
      <div className='space-y-2'>
        <Label htmlFor='dueDate'>Due Date *</Label>
        <Input
          id='dueDate'
          name='dueDate'
          type='date'
          value={formik.values.dueDate}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={isLoading}
        />
      </div>

      {/* Tags */}
      <div className='space-y-2'>
        <Label htmlFor='tags'>Tags</Label>
        <TagInput
          value={formik.values.tags || []}
          onChange={(tags) => formik.setFieldValue('tags', tags)}
          placeholder='Add tags to categorize this task...'
          disabled={isLoading}
        />
      </div>

      {/* Attachments */}
      <div className='space-y-2'>
        <Label htmlFor='attachments'>Attachments</Label>
        <AttachmentUpload
          value={formik.values.attachments || []}
          onChange={(files) => formik.setFieldValue('attachments', files)}
          disabled={isLoading}
          maxFiles={5}
          maxSize={10}
        />
      </div>
    </>
  );
};
