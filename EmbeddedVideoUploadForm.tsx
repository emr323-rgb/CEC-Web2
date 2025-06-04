import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  embeddedVideoId: z.string().min(1, 'Video ID is required'),
  videoPlatform: z.enum(['youtube', 'vimeo']),
});

type FormValues = z.infer<typeof formSchema>;

interface EmbeddedVideoUploadFormProps {
  section: string;
  contentKey: string;
  currentVideoId?: string;
  currentPlatform?: 'youtube' | 'vimeo';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const EmbeddedVideoUploadForm: React.FC<EmbeddedVideoUploadFormProps> = ({
  section,
  contentKey,
  currentVideoId = '',
  currentPlatform = 'youtube',
  onSuccess,
  onError,
}) => {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      embeddedVideoId: currentVideoId,
      videoPlatform: currentPlatform,
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      try {
        console.log(`Submitting video update for ${contentKey}:`, {
          section,
          key: contentKey,
          embeddedVideoId: data.embeddedVideoId,
          videoPlatform: data.videoPlatform,
        });
        
        const res = await apiRequest('POST', `/api/center/site-content/embedded-video/${contentKey}`, {
          section,
          key: contentKey,
          embeddedVideoId: data.embeddedVideoId,
          videoPlatform: data.videoPlatform,
        });
        
        // Check if response is OK before trying to parse JSON
        if (!res.ok) {
          // Try to get error details from the response
          let errorMessage = `Server error: ${res.status}`;
          try {
            const errorResponse = await res.json();
            errorMessage = errorResponse.message || errorMessage;
            console.error('Error response:', errorResponse);
          } catch (e) {
            // If we can't parse the JSON, just use the status code error
            console.error('Could not parse error response:', e);
          }
          throw new Error(errorMessage);
        }
        
        // Try to parse the response as JSON with error handling
        const text = await res.text();
        try {
          if (!text) {
            console.log('Empty response received, returning empty object');
            return {};
          }
          
          const result = JSON.parse(text);
          console.log('Successful response:', result);
          return result;
        } catch (e) {
          console.error('JSON parse error:', e, 'Response text:', text);
          toast({
            title: 'Warning',
            description: 'The server returned an invalid response, but your changes may have been saved.',
            variant: 'default',
          });
          return {}; // Return empty object on parse error
        }
      } catch (error) {
        console.error('Request error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate the cached content for this key
      queryClient.invalidateQueries({ queryKey: [`/api/center/site-content/by-key/${contentKey}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/center/site-content/embedded-video/${contentKey}`] });
      
      // Also save the video ID and platform to localStorage for direct access
      try {
        const formData = form.getValues();
        localStorage.setItem('homepage_hero_video_id', formData.embeddedVideoId);
        localStorage.setItem('homepage_hero_video_platform', formData.videoPlatform);
        console.log('Saved video info to localStorage:', {
          id: formData.embeddedVideoId,
          platform: formData.videoPlatform
        });
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }
      
      // Show toast notification
      toast({
        title: 'Video updated',
        description: 'The embedded video has been successfully updated and will work in both preview and deployment environments.',
      });
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error('Error in video update mutation:', error);
      
      // Show toast notification
      toast({
        title: 'Error updating video',
        description: 'There was a problem updating the video. Please try again.',
        variant: 'destructive',
      });
      
      // Call the error callback if provided
      if (onError) {
        onError(error.message || 'Unknown error occurred');
      }
    },
  });
  
  function onSubmit(data: FormValues) {
    updateMutation.mutate(data);
  }
  
  function generateHelpText(platform: string, videoId: string) {
    if (!videoId) return '';
    
    if (platform === 'youtube') {
      return `For a YouTube URL like "https://www.youtube.com/watch?v=dQw4w9WgXcQ", the ID is "dQw4w9WgXcQ"`;
    } else if (platform === 'vimeo') {
      return `For a Vimeo URL like "https://vimeo.com/148751763", the ID is "148751763"`;
    }
    
    return '';
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="videoPlatform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Platform</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the platform where your video is hosted.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="embeddedVideoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter video ID" {...field} />
              </FormControl>
              <FormDescription>
                {generateHelpText(form.watch('videoPlatform'), field.value)}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmbeddedVideoUploadForm;