import { Users, Target, Smartphone, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from './ui/utils';

const services = [
  {
    icon: Users,
    title: 'Digital Susu Groups',
    description:
      'Create or join savings circles with automated tracking and transparent management',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Target,
    title: 'Individual Goals',
    description:
      'Save for personal targets with discipline and track your progress in real-time',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Smartphone,
    title: 'Mobile Money Integration',
    description:
      'Seamless payments with Telecel, MTN, and Airtel mobile money platforms',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: BookOpen,
    title: 'Financial Literacy',
    description:
      'AI-powered tips and budgeting tools to help you make smarter financial decisions',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

export function Services() {
  return (
    <section id="services" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to achieve your savings goals, whether
            individually or as a group
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 bg-card group"
              >
                <CardHeader className="pb-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110',
                      service.bgColor,
                    )}
                  >
                    <Icon className={cn('h-6 w-6', service.color)} />
                  </div>
                  <CardTitle className="font-semibold text-xl text-foreground">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
