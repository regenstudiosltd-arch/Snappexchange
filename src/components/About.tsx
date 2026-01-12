import { Shield, Heart, Globe, TrendingUp } from 'lucide-react';
import Image from 'next/image';

const values = [
  {
    icon: Shield,
    title: 'Trust & Security',
    description:
      'Your money is safe with bank-level security and transparent tracking',
  },
  {
    icon: Heart,
    title: 'Community First',
    description:
      "Building on Ghana's rich tradition of communal savings and support",
  },
  {
    icon: Globe,
    title: 'Financial Inclusion',
    description: 'Making modern savings accessible to all Ghanaians',
  },
  {
    icon: TrendingUp,
    title: 'Growth Focused',
    description: 'Empowering users to achieve their financial goals faster',
  },
];

export function About() {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Image */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 bg-linear-to-r from-[#DC2626] via-[#F59E0B] to-[#059669] rounded-2xl opacity-20 blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1758518730083-4c12527b6742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMG1lZXRpbmclMjBidXNpbmVzc3xlbnwxfHx8fDE3NjQwMDA4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Team collaboration"
                width={500}
                height={500}
                className="w-full h-100 md:h-125 object-cover"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-6 order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl">About SnappX</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                SnappX is revolutionizing how Ghanaians save money by bringing
                the traditional susu system into the digital age. Our platform
                combines the trust and community of traditional savings circles
                with the convenience and transparency of modern technology.
              </p>
              <p>
                Founded by a team of Ghanaian fintech experts, we understand the
                unique financial needs of our community. We are committed to
                building a platform that empowers individuals and groups to
                achieve their financial goals through disciplined savings and
                mutual support.
              </p>
              <p>
                With mobile money integration, AI-powered financial tips, and
                automated tracking, we are making it easier than ever for
                Ghanaians to build wealth and secure their financial future.
              </p>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div>
          <h3 className="text-2xl md:text-3xl text-center mb-12">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-linear-to-br from-[#DC2626]/10 via-[#F59E0B]/10 to-[#059669]/10 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-[#F59E0B]" />
                  </div>
                  <h4>{value.title}</h4>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
