import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { ArrowRight } from "lucide-react";
import { Treatment } from "@shared/schema";

interface SiteContent {
  id: number;
  key: string;
  title: string;
  content: string;
  section: string;
  updatedAt: string;
}

export default function TreatmentsPage() {
  const { data: treatments = [], isLoading } = useQuery<Treatment[]>({
    queryKey: ['/api/center/treatments'],
  });

  const { data: pageContent, isLoading: isLoadingContent } = useQuery<SiteContent>({
    queryKey: ['/api/center/content/treatments_page_intro'],
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6 text-[#333] inline-block relative accent-underline">
          {pageContent?.title || "Our Treatment Programs"}
        </h1>
        <p className="text-[#767676] max-w-3xl mx-auto text-lg">
          {pageContent?.content || 
            "Complete Eating Care offers a comprehensive range of treatment options tailored to meet the unique needs of individuals struggling with eating disorders. Our evidence-based programs provide the support, structure, and specialized care needed for lasting recovery."}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-3/4 mb-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4 rounded-lg" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {treatments.map((treatment, index) => (
            <ScrollAnimation 
              key={treatment.id} 
              animationType="fade" 
              direction="up"
              delay={0.1 * (index % 2)}
            >
              <Card className="border-0 shadow-sm h-full flex flex-col transition-transform hover:scale-[1.02] hover:shadow-md">
                {treatment.imageUrl && (
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={treatment.imageUrl} 
                      alt={treatment.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{treatment.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-[#767676] mb-6">
                    {treatment.description && (
                      <p className="line-clamp-4">
                        {treatment.description}
                      </p>
                    )}
                  </div>
                  <Link href={`/treatments/${treatment.id}`}>
                    <Button variant="link" className="text-[#5a9e97] font-medium p-0 flex items-center gap-1">
                      Learn More <ArrowRight size={16} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </ScrollAnimation>
          ))}
        </div>
      )}
    </div>
  );
}