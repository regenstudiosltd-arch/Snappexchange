import { Users, Target, Smartphone, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const services = [
  {
    icon: Users,
    title: 'Digital Susu Groups',
    description:
      'Create or join savings circles with automated tracking and transparent management',
    color: 'text-[#DC2626]',
    bgColor: 'bg-[#DC2626]/10',
  },
  {
    icon: Target,
    title: 'Individual Goals',
    description:
      'Save for personal targets with discipline and track your progress in real-time',
    color: 'text-[#F59E0B]',
    bgColor: 'bg-[#F59E0B]/10',
  },
  {
    icon: Smartphone,
    title: 'Mobile Money Integration',
    description:
      'Seamless payments with Telecel, MTN, and Airtel mobile money platforms',
    color: 'text-[#059669]',
    bgColor: 'bg-[#059669]/10',
  },
  {
    icon: BookOpen,
    title: 'Financial Literacy',
    description:
      'AI-powered tips and budgeting tools to help you make smarter financial decisions',
    color: 'text-[#DC2626]',
    bgColor: 'bg-[#DC2626]/10',
  },
];

export function Services() {
  return (
    <section id="services" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-4">Our Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                className="border-2 border-gray-200 hover:border-[#F59E0B]/50 transition-all hover:shadow-lg group"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${service.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`h-6 w-6 ${service.color}`} />
                  </div>
                  <CardTitle className="font-medium text-[20px]">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 font-normal">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
