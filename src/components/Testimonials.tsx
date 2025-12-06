"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const testimonials = [
  {
    name: "Akosua Mensah",
    role: "Small Business Owner",
    image: "https://images.unsplash.com/photo-1530785602389-07594beb8b73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGFmcmljYW4lMjB3b21hbnxlbnwxfHx8fDE3NjQwMDA4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    content: "SnappX has transformed how I save for my business. The group savings feature helped me raise capital for expansion within 6 months!",
    rating: 5,
  },
  {
    name: "Kwame Boateng",
    role: "Teacher",
    image: "https://images.unsplash.com/photo-1495603889488-42d1d66e5523?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYnVzaW5lc3MlMjBtYW58ZW58MXx8fHwxNzY0MDAwODA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    content: "I've tried many savings apps, but SnappX is the best. The AI tips help me budget better, and the mobile money integration is seamless.",
    rating: 5,
  },
  {
    name: "Ama Osei",
    role: "Nurse",
    image: "https://images.unsplash.com/photo-1530785602389-07594beb8b73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGFmcmljYW4lMjB3b21hbnxlbnwxfHx8fDE3NjQwMDA4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    content: "Our susu group of 10 nurses has saved over ₵50,000 together. SnappX makes it so easy to track contributions and manage payouts.",
    rating: 5,
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const previous = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-4">What Our Users Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied Ghanaians who trust SnappX for their savings
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F59E0B]/20 to-transparent" />
            <CardContent className="p-8 md:p-12">
              <Quote className="h-12 w-12 text-[#F59E0B]/20 mb-6" />
              
              <div className="grid md:grid-cols-[200px,1fr] gap-8 items-center">
                {/* User Image */}
                <div className="mx-auto md:mx-0">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-br from-[#DC2626] via-[#F59E0B] to-[#059669] rounded-full opacity-50 blur-lg" />
                    <ImageWithFallback
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      className="relative w-40 h-40 rounded-full object-cover border-4 border-background"
                    />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <div className="flex mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>
                  
                  <p className="text-lg mb-6 leading-relaxed">
                    "{testimonials[currentIndex].content}"
                  </p>
                  
                  <div>
                    <div className="text-lg">{testimonials[currentIndex].name}</div>
                    <div className="text-muted-foreground">{testimonials[currentIndex].role}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={previous}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? "w-8 bg-[#F59E0B]" 
                      : "w-2 bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
