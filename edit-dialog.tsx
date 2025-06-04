import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/ui/file-upload';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'email' | 'number' | 'file-upload';
  options?: { value: string; label: string }[];
  placeholder?: string;
  uploadType?: 'image' | 'video' | 'any';
}

interface EditDialogProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  fields: Field[];
  initialData: Record<string, any>;
}

export function EditDialog({
  title,
  description,
  isOpen,
  onClose,
  onSave,
  fields,
  initialData,
}: EditDialogProps) {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      toast({
        title: 'Success',
        description: 'Changes saved successfully',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {fields.map((field) => (
              <div key={field.name} className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor={field.name} className="mt-2">
                  {field.label}
                </Label>
                <div className="col-span-3">
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'file-upload' ? (
                    <div className="mt-2">
                      {formData[field.name] && (
                        <div className="mb-2">
                          {field.uploadType === 'image' || (!field.uploadType && formData[field.name].endsWith('.jpg') || formData[field.name].endsWith('.png') || formData[field.name].endsWith('.gif')) ? (
                            <div className="relative h-40 w-full overflow-hidden rounded-md mb-2">
                              <img 
                                src={formData[field.name]} 
                                alt="Current" 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="p-4 bg-gray-100 rounded-md text-center mb-2">
                              <p className="text-sm font-medium">Current file: {formData[field.name].split('/').pop()}</p>
                            </div>
                          )}
                        </div>
                      )}
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        placeholder={field.placeholder || "Enter URL or upload below"}
                        className="w-full mb-2"
                      />
                      <FileUpload 
                        uploadType={field.uploadType || 'any'}
                        onUpload={(file) => console.log("Handling file upload:", file.name)}
                        onComplete={(url) => setFormData(prev => ({ ...prev, [field.name]: url }))}
                      />
                    </div>
                  ) : (
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}