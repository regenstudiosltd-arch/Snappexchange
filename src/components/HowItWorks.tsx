import { UserPlus, Users, Wallet, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up',
    description:
      'Create your free account in minutes with just your phone number',
    step: '01',
  },
  {
    icon: Users,
    title: 'Create or Join Group',
    description: 'Start your own savings group or join an existing one',
    step: '02',
  },
  {
    icon: Wallet,
    title: 'Make Contributions',
    description:
      'Contribute regularly via mobile money with automated reminders',
    step: '03',
  },
  {
    icon: TrendingUp,
    title: 'Receive Payouts',
    description:
      "Get your savings when it's your turn or when you reach your goal",
    step: '04',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-16 md:py-24 bg-linear-to-br from-[#DC2626]/5 via-[#F59E0B]/5 to-[#059669]/5"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started with SnappX in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-linear-to-r from-[#F59E0B] to-[#F59E0B]/20" />
                )}

                <div className="relative text-center group">
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="relative mx-auto w-20 h-20 rounded-full bg-linear-to-br from-[#DC2626] via-[#F59E0B] to-[#059669] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
                      <Icon className="h-8 w-8 text-[#F59E0B]" />
                    </div>
                  </div>

                  <h3 className="mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
