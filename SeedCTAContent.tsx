import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SeedCTAContent() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  
  const createContentMutation = useMutation({
    mutationFn: async (contentData: any) => {
      const response = await apiRequest("POST", `/api/center/content`, contentData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create content");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content created",
        description: "Homepage CTA section content has been successfully created.",
      });
      setIsSeeding(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating content",
        description: error.message,
        variant: "destructive",
      });
      setIsSeeding(false);
    }
  });

  const seedCTAContent = async () => {
    setIsSeeding(true);
    
    try {
      await createContentMutation.mutateAsync({
        key: "homepage_cta_section",
        title: "Ready to Begin Your Journey to Recovery?",
        content: "Our compassionate team is here to support you every step of the way. Reach out today to learn more about our programs and how we can help.",
        section: "homepage"
      });
    } catch (error) {
      console.error("Error seeding CTA content:", error);
    }
  };

  return (
    <div className="p-4 border rounded-lg mt-4">
      <h3 className="text-lg font-semibold mb-2">Seed Missing CTA Section Content</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click the button below to seed the homepage CTA section content.
      </p>
      <Button 
        onClick={seedCTAContent} 
        disabled={isSeeding}
        className="bg-primary hover:bg-primary/90"
      >
        {isSeeding ? "Creating Content..." : "Seed CTA Content"}
      </Button>
    </div>
  );
}