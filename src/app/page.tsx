"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Recycle,
  Truck,
  MapPin,
  Bell,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Users,
  Clock,
  Sparkles,
} from "lucide-react";

// Hook for intersection observer (scrollytelling)
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Parallax hook
function useParallax() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
}

// Animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView(0.5);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  const { ref, isInView } = useInView(0.2);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white border border-neutral-200 p-8 transition-all duration-500",
        "hover:shadow-eco-lg hover:-translate-y-1",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Gradient hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-50 text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 mb-3">{title}</h3>
        <p className="text-neutral-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Step card for "How it works"
function StepCard({
  number,
  title,
  description,
  index,
}: {
  number: number;
  title: string;
  description: string;
  index: number;
}) {
  const { ref, isInView } = useInView(0.3);

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex gap-6 transition-all duration-700",
        isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Number bubble */}
      <div className="shrink-0">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-lg shadow-eco">
          {number}
        </div>
        {index < 3 && (
          <div className="hidden md:block w-0.5 h-20 bg-gradient-to-b from-primary-300 to-transparent mx-auto mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="pb-8">
        <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
        <p className="text-neutral-600">{description}</p>
      </div>
    </div>
  );
}

// Stat card for impact section
function ImpactStat({
  value,
  label,
  suffix = "",
  index,
}: {
  value: number;
  label: string;
  suffix?: string;
  index: number;
}) {
  const { ref, isInView } = useInView(0.3);

  return (
    <div
      ref={ref}
      className={cn(
        "text-center transition-all duration-500",
        isInView ? "opacity-100 scale-100" : "opacity-0 scale-90"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        <AnimatedCounter end={value} suffix={suffix} />
      </div>
      <div className="text-primary-100 text-sm font-medium">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const scrollY = useParallax();
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section with Parallax */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Parallax Background Elements */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-white to-white"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />

        {/* Floating shapes - parallax */}
        <div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl"
          style={{ transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent-leaf/20 rounded-full blur-3xl"
          style={{ transform: `translate(-${scrollY * 0.08}px, -${scrollY * 0.05}px)` }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent-water/10 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * -0.15}px)` }}
        />

        {/* Floating icons */}
        <div
          className="absolute top-1/4 left-[15%] opacity-20"
          style={{ transform: `translateY(${scrollY * -0.2}px) rotate(${scrollY * 0.02}deg)` }}
        >
          <Recycle className="w-16 h-16 text-primary-500" />
        </div>
        <div
          className="absolute top-1/3 right-[20%] opacity-20"
          style={{ transform: `translateY(${scrollY * -0.15}px) rotate(-${scrollY * 0.03}deg)` }}
        >
          <Leaf className="w-12 h-12 text-accent-leaf" />
        </div>
        <div
          className="absolute bottom-1/4 left-[25%] opacity-15"
          style={{ transform: `translateY(${scrollY * -0.25}px)` }}
        >
          <Truck className="w-14 h-14 text-primary-400" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-8 animate-fade-in"
          >
            <Sparkles className="w-4 h-4" />
            <span>Now serving all 35 barangays of Panabo City</span>
          </div>

          {/* Main Heading */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 leading-tight tracking-tight animate-fade-in-up"
          >
            Smart Waste Collection
            <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-500 to-accent-leaf">
              for a Cleaner Panabo
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="mt-6 text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            Request pickups, track collections in real-time, and contribute to a
            sustainable future. Join thousands of residents making waste
            management effortless.
          </p>

          {/* CTA Buttons */}
          <div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <Link href="/register">
              <Button size="xl" className="group">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="xl">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-500 animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary-500" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary-500" />
              <span>Local government verified</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-neutral-300 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-neutral-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              Everything you need for
              <span className="text-primary-600"> efficient waste management</span>
            </h2>
            <p className="text-lg text-neutral-600">
              Our platform streamlines the entire waste collection process, from
              request to completion.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              icon={Recycle}
              title="Easy Collection Requests"
              description="Request waste pickup with just a few taps. Specify waste type, upload photos, and set your preferred schedule."
              index={0}
            />
            <FeatureCard
              icon={MapPin}
              title="Real-Time Tracking"
              description="Track your collection request status and see collector locations in real-time on an interactive map."
              index={1}
            />
            <FeatureCard
              icon={Bell}
              title="Smart Notifications"
              description="Get instant updates about your collection status, schedule changes, and important announcements."
              index={2}
            />
            <FeatureCard
              icon={Truck}
              title="Optimized Routes"
              description="Our smart routing ensures collectors take the most efficient paths, reducing fuel consumption and emissions."
              index={3}
            />
            <FeatureCard
              icon={BarChart3}
              title="Analytics Dashboard"
              description="Access detailed reports on collection history, waste volume trends, and environmental impact."
              index={4}
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Reliable"
              description="Your data is protected with enterprise-grade security. Reliable service backed by local government."
              index={5}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
                Get started in
                <span className="text-primary-600"> minutes</span>
              </h2>
              <p className="text-lg text-neutral-600 mb-12">
                Our streamlined process makes waste collection request as simple
                as ordering food online.
              </p>

              <div className="space-y-2">
                <StepCard
                  number={1}
                  title="Create Your Account"
                  description="Sign up with your email and verify your address in Panabo City. It takes less than 2 minutes."
                  index={0}
                />
                <StepCard
                  number={2}
                  title="Submit a Collection Request"
                  description="Choose your waste type, add photos if needed, and select your preferred pickup time."
                  index={1}
                />
                <StepCard
                  number={3}
                  title="Track Your Request"
                  description="Monitor your request status in real-time and receive notifications at every step."
                  index={2}
                />
                <StepCard
                  number={4}
                  title="Collection Complete"
                  description="Our collectors handle your waste responsibly. Rate the service and view your impact."
                  index={3}
                />
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              {/* Phone mockup placeholder */}
              <div className="relative mx-auto max-w-sm">
                <div className="aspect-[9/19] rounded-[3rem] bg-gradient-to-br from-neutral-900 to-neutral-800 p-3 shadow-2xl">
                  <div className="h-full w-full rounded-[2.5rem] bg-gradient-to-br from-primary-50 to-white overflow-hidden">
                    {/* App UI Mockup */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                          <Recycle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-neutral-900">
                            EcoCollect
                          </div>
                          <div className="text-xs text-neutral-500">
                            Request Pickup
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white shadow-sm border border-neutral-100">
                          <div className="text-xs text-neutral-500 mb-1">
                            Waste Type
                          </div>
                          <div className="text-sm font-medium text-neutral-900">
                            Recyclable
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white shadow-sm border border-neutral-100">
                          <div className="text-xs text-neutral-500 mb-1">
                            Pickup Date
                          </div>
                          <div className="text-sm font-medium text-neutral-900">
                            Tomorrow, 8:00 AM
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-primary-500 text-white text-center font-medium shadow-eco">
                          Submit Request
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 p-3 rounded-xl bg-white shadow-lg border border-neutral-100 animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-xs">
                      <div className="font-medium text-neutral-900">
                        Completed
                      </div>
                      <div className="text-neutral-500">Just now</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 p-3 rounded-xl bg-white shadow-lg border border-neutral-100 animate-float-slow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="text-xs">
                      <div className="font-medium text-neutral-900">
                        On the way
                      </div>
                      <div className="text-neutral-500">ETA: 15 mins</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section with Parallax */}
      <section
        id="impact"
        className="relative py-24 md:py-32 overflow-hidden"
      >
        {/* Parallax Background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700"
          style={{ transform: `translateY(${(scrollY - 1500) * 0.05}px)` }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating shapes */}
        <div
          className="absolute top-20 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
          style={{ transform: `translateY(${(scrollY - 1500) * -0.1}px)` }}
        />
        <div
          className="absolute bottom-10 right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl"
          style={{ transform: `translateY(${(scrollY - 1500) * 0.08}px)` }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Our Environmental Impact
            </h2>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">
              Together with the residents of Panabo City, we&apos;re making a real
              difference in waste management and environmental protection.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <ImpactStat
              value={15000}
              suffix="+"
              label="Active Users"
              index={0}
            />
            <ImpactStat
              value={50000}
              suffix="+"
              label="Collections Completed"
              index={1}
            />
            <ImpactStat
              value={35}
              label="Barangays Covered"
              index={2}
            />
            <ImpactStat
              value={98}
              suffix="%"
              label="Satisfaction Rate"
              index={3}
            />
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link href="/register">
              <Button size="xl" variant="secondary" className="bg-white text-primary-600 hover:bg-primary-50">
                Join the Movement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              Loved by residents of
              <span className="text-primary-600"> Panabo City</span>
            </h2>
            <p className="text-lg text-neutral-600">
              See what our users have to say about their experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Finally, a modern solution for waste management! The app is so easy to use, and I love tracking when my garbage will be picked up.",
                author: "Maria Santos",
                role: "Resident, Brgy. Gredu",
              },
              {
                quote:
                  "As a busy professional, I don't have time to worry about garbage schedules. EcoCollect sends me notifications so I never miss a pickup.",
                author: "Juan dela Cruz",
                role: "Resident, Brgy. San Francisco",
              },
              {
                quote:
                  "The environmental impact stats inspire me to recycle more. Great initiative by the local government!",
                author: "Ana Reyes",
                role: "Resident, Brgy. Kasilak",
              },
            ].map((testimonial, i) => {
              const { ref, isInView } = useInView(0.2);
              return (
                <div
                  key={i}
                  ref={ref}
                  className={cn(
                    "p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm transition-all duration-500",
                    isInView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  )}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg
                        key={j}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-12 md:p-16 rounded-3xl bg-gradient-to-br from-primary-600 to-primary-700 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-6">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to make a difference?
              </h2>
              <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
                Join thousands of Panabo City residents who are already using
                EcoCollect for smarter, greener waste management.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="xl"
                    className="bg-white text-primary-600 hover:bg-primary-50"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#contact">
                  <Button
                    variant="ghost"
                    size="xl"
                    className="text-white hover:bg-white/10"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 md:py-32 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left: Contact Info */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                Get in touch
              </h2>
              <p className="text-lg text-neutral-600 mb-8">
                Have questions or feedback? We&apos;d love to hear from you. Our team
                is here to help.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      Visit Us
                    </h3>
                    <p className="text-neutral-600">
                      City Hall, Quezon Street
                      <br />
                      Panabo City, Davao del Norte
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      Office Hours
                    </h3>
                    <p className="text-neutral-600">
                      Monday - Friday: 8:00 AM - 5:00 PM
                      <br />
                      Saturday: 8:00 AM - 12:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      Community Support
                    </h3>
                    <p className="text-neutral-600">
                      Join our Facebook community for tips,
                      <br />
                      updates, and eco-friendly practices.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">
                Send us a message
              </h3>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                      placeholder="dela Cruz"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                    placeholder="juan@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
