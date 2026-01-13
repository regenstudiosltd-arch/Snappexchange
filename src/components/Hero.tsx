import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';

interface HeroProps {
  onNavigate?: (view: string) => void;
}

export function Hero({ onNavigate }: HeroProps = {}) {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-cyan-50 via-teal-50 to-blue-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-slate-100 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 border border-cyan-200">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              <span className="text-sm text-cyan-700">
                Digital Susu Made Simple
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl">
              Modern Group Savings for Ghana
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Save individually or in groups with ease. Join thousands of
              Ghanaians building wealth through our trusted digital susu
              platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-600 group"
                onClick={() => onNavigate?.('signup')}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl text-cyan-600">10k+</div>
                <div className="text-sm text-muted-foreground">
                  Active Users
                </div>
              </div>
              <div>
                <div className="text-3xl text-teal-600">500+</div>
                <div className="text-sm text-muted-foreground">
                  Savings Groups
                </div>
              </div>
              <div>
                <div className="text-3xl text-cyan-600">₵5M+</div>
                <div className="text-sm text-muted-foreground">Saved</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-linear-to-r from-cyan-400 via-teal-500 to-cyan-600 rounded-2xl opacity-20 blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1655720360377-b97f6715e1ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwY29tbXVuaXR5JTIwc2F2aW5nc3xlbnwxfHx8fDE3NjQwMDA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Community savings"
                width={400}
                height={400}
                className="w-full h-100 md:h-125 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
