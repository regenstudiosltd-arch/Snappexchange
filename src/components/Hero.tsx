import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';

interface HeroProps {
  onNavigate?: (view: string) => void;
}

export function Hero({ onNavigate }: HeroProps = {}) {
  return (
    <section id="hero" className="relative overflow-hidden bg-background">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-900/50 mask-[linear-gradient(0deg,transparent_0%,white_30%,white_70%,transparent_100%)] -z-10" />

      <div className="container mx-auto px-4 py-16 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Digital Susu Made Simple
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Modern Group Savings for Ghana
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Save individually or in groups with ease. Join thousands of
              Ghanaians building wealth through our trusted digital susu
              platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 group text-primary-foreground"
                onClick={() => onNavigate?.('signup')}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  10k+
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Active Users
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  500+
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Savings Groups
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  ₵5M+
                </div>
                <div className="text-sm text-muted-foreground mt-1">Saved</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative order-first lg:order-last">
            <div className="absolute -inset-8 md:-inset-12 bg-linear-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-3xl opacity-40" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
              <Image
                src="https://images.unsplash.com/photo-1655720360377-b97f6715e1ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwY29tbXVuaXR5JTIwc2F2aW5nc3xlbnwxfHx8fDE3NjQwMDA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Community savings"
                width={600}
                height={600}
                className="w-full h-auto aspect-square md:aspect-4/3 lg:aspect-square object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
