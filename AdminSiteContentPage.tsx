import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SiteContent } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const updateContentSchema = z.object({
  id: z.number(),
  key: z.string(),
  title: z.string().optional(),
  content: z.string(),
  section: z.string(),
});

type UpdateContentSchema = z.infer<typeof updateContentSchema>;

export default function AdminSiteContentPage() {
  const { toast } = useToast();
  const [activeSectionAccordion, setActiveSectionAccordion] = useState<string | null>(null);
  const [expandedContentItems, setExpandedContentItems] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setActiveSectionAccordion(activeSectionAccordion === section ? null : section);
  };

  const toggleContentItem = (contentId: number) => {
    setExpandedContentItems({
      ...expandedContentItems,
      [contentId]: !expandedContentItems[contentId],
    });
  };

  // Get homepage content sections
  const { data: homepageContent, isLoading: isHomepageLoading } = useQuery<SiteContent[]>({
    queryKey: ['/api/center/content/section/homepage'],
    queryFn: async () => {
      const res = await fetch('/api/center/content/section/homepage');
      if (!res.ok) throw new Error('Failed to fetch homepage content');
      return res.json();
    },
  });

  // Get about us content sections
  const { data: aboutUsContent, isLoading: isAboutUsLoading } = useQuery<SiteContent[]>({
    queryKey: ['/api/center/content/section/about'],
    queryFn: async () => {
      const res = await fetch('/api/center/content/section/about');
      if (!res.ok) throw new Error('Failed to fetch about us content');
      return res.json();
    },
  });

  // Update content mutation
  const updateContentMutation = useMutation({
    mutationFn: async (data: UpdateContentSchema) => {
      const res = await apiRequest('PATCH', `/api/center/content/${data.id}`, data);
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update content');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Content updated',
        description: 'The content has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/center/content/section/homepage'] });
      queryClient.invalidateQueries({ queryKey: ['/api/center/content/section/about'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating content',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create form for each content item
  const ContentForm = ({ content }: { content: SiteContent }) => {
    const form = useForm<UpdateContentSchema>({
      resolver: zodResolver(updateContentSchema),
      defaultValues: {
        id: content.id,
        key: content.key,
        title: content.title || '',
        content: content.content,
        section: content.section,
      },
    });

    const onSubmit = (data: UpdateContentSchema) => {
      updateContentMutation.mutate(data);
    };

    const isExpanded = expandedContentItems[content.id] || false;

    return (
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-gray-50 cursor-pointer" onClick={() => toggleContentItem(content.id)}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-md">
                {content.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </CardTitle>
              <CardDescription className="text-xs">
                {isExpanded
                  ? 'Click to collapse this content item'
                  : 'Click to expand and edit this content item'}
              </CardDescription>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        {isExpanded && (
          <>
            <CardContent className="pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Key (ID)</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormDescription>
                          This is the identifier used to fetch this content in the application.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {content.title !== null && (
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter content"
                            className="min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormDescription>
                          The section this content belongs to.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="mt-2"
                    disabled={updateContentMutation.isPending}
                  >
                    {updateContentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        )}
      </Card>
    );
  };

  const isLoading = isHomepageLoading || isAboutUsLoading;

  return (
    <AdminLayout>
      <div className="container py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-teal-800">Content Management</h1>
          <p className="text-muted-foreground">
            Edit website content by section
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle>Website Content Sections</CardTitle>
                <CardDescription>
                  Click on a section to view and edit its content.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible>
                  <AccordionItem value="homepage">
                    <AccordionTrigger 
                      onClick={() => toggleSection('homepage')}
                      className="text-lg font-medium"
                    >
                      Homepage Content
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="py-4 space-y-4">
                        {homepageContent?.map(content => (
                          <ContentForm key={content.id} content={content} />
                        ))}
                        {homepageContent?.length === 0 && (
                          <p className="text-gray-500 italic">No content found for this section.</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="about">
                    <AccordionTrigger 
                      onClick={() => toggleSection('about')}
                      className="text-lg font-medium"
                    >
                      About Us Content
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="py-4 space-y-4">
                        {aboutUsContent?.map(content => (
                          <ContentForm key={content.id} content={content} />
                        ))}
                        {aboutUsContent?.length === 0 && (
                          <p className="text-gray-500 italic">No content found for this section.</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}