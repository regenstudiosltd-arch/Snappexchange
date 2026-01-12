import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface CTAProps {
  onNavigate?: (view: string) => void;
}

export function CTA({ onNavigate }: CTAProps = {}) {
  return (
    <section className="py-16 md:py-24 bg-linear-to-br from-cyan-500 via-cyan-600 to-teal-600 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNi0yLjY4Ni02LTYtNnoiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Start Your Journey Today</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl">
            Ready to Start Your Savings Journey?
          </h2>

          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Join thousands of Ghanaians who are building wealth through smart
            savings. Create your free account in minutes and start saving today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-cyan-600 hover:bg-gray-100 group"
              onClick={() => onNavigate?.('signup')}
            >
              Create Account
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              className="text-white hover:text-gray-800 hover:bg-white/10 border border-gray-200 bg-gray-50/30"
              onClick={() => onNavigate?.('login')}
            >
              Login
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-teal-300" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-teal-300" />
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-teal-300" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
