"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import {
  Calendar, Users, DollarSign, Package, MessageSquare,
  ChevronLeft, ChevronRight, Star, Check, Scissors,
  Clock, TrendingUp, Shield, Zap, ArrowRight, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Manage appointments with an intuitive calendar. Never double-book or miss a client again.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Track every client's history, preferences, and automatically suggest their next visit.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: DollarSign,
    title: "Financial Tracking",
    description: "Monitor income and expenses with beautiful charts. Know your profit at a glance.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    icon: Package,
    title: "Inventory Control",
    description: "Keep track of all your products and supplies. Get alerts when stock is running low.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Reminders",
    description: "Send appointment reminders via WhatsApp with one click. Reduce no-shows instantly.",
    color: "text-teal-500",
    bg: "bg-teal-50",
  },
  {
    icon: TrendingUp,
    title: "Business Analytics",
    description: "Detailed reports and insights to help you grow your barbershop business.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
];

const testimonials = [
  {
    name: "Marcus T.",
    role: "Owner, King's Cut Barbershop",
    text: "BarberPro completely transformed how we run the shop. Appointments are up 40% and I finally know exactly where my money goes.",
    rating: 5,
    avatar: "MT",
  },
  {
    name: "Darnell R.",
    role: "Master Barber, Fresh Fades Studio",
    text: "The WhatsApp reminder feature alone saved us from countless no-shows. Best investment we made this year.",
    rating: 5,
    avatar: "DR",
  },
  {
    name: "Carlos M.",
    role: "Owner, The Classic Cut",
    text: "I can manage everything from my phone. Client history, finances, inventory — it's all in one place and works perfectly.",
    rating: 5,
    avatar: "CM",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: 29,
    description: "Perfect for solo barbers",
    features: ["Up to 100 appointments/month", "Client management", "Basic financial tracking", "1 barber account", "Email support"],
    popular: false,
  },
  {
    name: "Professional",
    price: 59,
    description: "Ideal for small barbershops",
    features: ["Unlimited appointments", "Full client management", "Advanced financials & reports", "Up to 5 barber accounts", "Inventory tracking", "WhatsApp reminders", "Priority support"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 99,
    description: "For multi-location businesses",
    features: ["Everything in Professional", "Multiple locations", "Custom analytics", "Unlimited barber accounts", "API access", "Dedicated account manager", "24/7 phone support"],
    popular: false,
  },
];

function useIntersectionObserver(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  const hero = useIntersectionObserver();
  const featuresSection = useIntersectionObserver();
  const gallery1 = useIntersectionObserver();
  const gallery2 = useIntersectionObserver();
  const gallery3 = useIntersectionObserver();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setCurrentSlide(emblaApi.selectedScrollSnap()));
    const autoplay = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => clearInterval(autoplay);
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xl font-bold ${scrolled ? "text-gray-900" : "text-white"}`}>
                BarberPro
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "Gallery", "Pricing", "Testimonials"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${scrolled ? "text-gray-600" : "text-white/90"}`}
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className={scrolled ? "text-gray-700" : "text-white hover:bg-white/10"}>
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started Free
                </Button>
              </Link>
            </div>

            <button
              className={`md:hidden ${scrolled ? "text-gray-900" : "text-white"}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t mt-3 py-4 px-4 space-y-3">
            {["Features", "Gallery", "Pricing", "Testimonials"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="block text-gray-700 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                {item}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3 border-t">
              <Link href="/login"><Button variant="outline" className="w-full">Sign In</Button></Link>
              <Link href="/register"><Button className="w-full bg-blue-600">Get Started Free</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200"
            alt="Barber at work"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30 text-sm px-4 py-1.5">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                The #1 Barbershop Management Platform
              </Badge>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Run Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Barbershop
              </span>{" "}
              Like a Pro
            </motion.h1>

            <motion.p
              className="text-xl text-white/80 mb-8 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Manage appointments, clients, finances, and inventory — all in one powerful platform built specifically for modern barbershops.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 text-base h-12">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 px-8 text-base h-12">
                  Sign In to Dashboard
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {[
                { icon: Shield, text: "No credit card required" },
                { icon: Clock, text: "Setup in 5 minutes" },
                { icon: Users, text: "Join 500+ barbershops" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/70">
                  <item.icon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>


      </section>

      {/* Stats Bar */}
      <section className="bg-blue-600 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Active Barbershops" },
              { value: "50K+", label: "Appointments Managed" },
              { value: "99.9%", label: "Uptime Guaranteed" },
              { value: "4.9/5", label: "Average Rating" },
            ].map((stat, i) => (
              <div key={i} className="text-center text-white">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-blue-200 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={featuresSection.ref} className={`text-center mb-16 transition-all duration-700 ${featuresSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              Everything You Need
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Barbershops
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From scheduling to finances, we've built everything you need to run a successful barbershop business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery / Image Sections */}
      <section id="gallery">
        {/* Feature 1: Left image, right text */}
        <div ref={gallery1.ref} className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className={`transition-all duration-700 ${gallery1.isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"}`}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                  <Image
                    src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800"
                    alt="Modern barbershop interior"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className={`transition-all duration-700 delay-200 ${gallery1.isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"}`}>
                <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Smart Scheduling</Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Never Miss an Appointment Again
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Our intelligent scheduling system gives you a complete view of your day, week, and month.
                  Book appointments, manage cancellations, and send automated reminders — all from one dashboard.
                </p>
                <ul className="space-y-3 mb-8">
                  {["Real-time calendar view", "Automatic conflict detection", "Multi-barber scheduling", "Client history tracking"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Start Managing Appointments <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Right image, left text */}
        <div ref={gallery2.ref} className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className={`order-2 lg:order-1 transition-all duration-700 ${gallery2.isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"}`}>
                <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">Financial Control</Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Know Your Numbers, Grow Your Business
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Track every dollar in and out of your barbershop. Beautiful charts show you monthly revenue,
                  expense breakdowns, and profit trends so you can make smart business decisions.
                </p>
                <ul className="space-y-3 mb-8">
                  {["Income and expense tracking", "Monthly profit reports", "Service revenue breakdown", "Tax-ready financial exports"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Track Your Finances <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className={`order-1 lg:order-2 transition-all duration-700 delay-200 ${gallery2.isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"}`}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                  <Image
                    src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800"
                    alt="Barber tools"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Left image, right text */}
        <div ref={gallery3.ref} className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className={`transition-all duration-700 ${gallery3.isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"}`}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                  <Image
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800"
                    alt="Barbershop chairs"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className={`transition-all duration-700 delay-200 ${gallery3.isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"}`}>
                <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">WhatsApp Integration</Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Connect with Clients via WhatsApp
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Send appointment reminders, confirmations, and follow-ups directly through WhatsApp.
                  Reduce no-shows by up to 60% and keep your clients engaged and coming back.
                </p>
                <ul className="space-y-3 mb-8">
                  {["One-click WhatsApp messages", "Appointment reminders", "Booking confirmations", "Follow-up messages"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-purple-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Start Messaging Clients <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Carousel */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything in One Powerful Dashboard
            </h2>
            <p className="text-blue-200 max-w-xl mx-auto">
              See how BarberPro simplifies every aspect of running your barbershop
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
              <div className="flex">
                {[
                  { img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200", title: "Professional Service", desc: "Deliver exceptional cuts with streamlined workflows" },
                  { img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800", title: "Modern Environment", desc: "Manage your entire shop from anywhere" },
                  { img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800", title: "Expert Barbers", desc: "Track each barber's performance and schedule" },
                  { img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800", title: "Premium Experience", desc: "Give clients the VIP treatment they deserve" },
                ].map((slide, i) => (
                  <div key={i} className="flex-[0_0_100%] min-w-0 relative aspect-[16/7]">
                    <Image src={slide.img} alt={slide.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h3 className="text-2xl font-bold mb-2">{slide.title}</h3>
                      <p className="text-white/80">{slide.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex justify-center mt-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`w-2 h-2 rounded-full transition-all ${currentSlide === i ? "w-6 bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Pricing</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your barbershop</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-2xl p-8 ${plan.popular ? "bg-blue-600 text-white shadow-2xl scale-105" : "bg-white shadow-sm border"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white border-orange-500 px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.popular ? "text-blue-200" : "text-gray-500"}`}>{plan.description}</p>
                <div className="mb-6">
                  <span className={`text-5xl font-extrabold ${plan.popular ? "text-white" : "text-gray-900"}`}>${plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.popular ? "text-blue-200" : "text-gray-500"}`}>/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-center gap-3 text-sm ${plan.popular ? "text-blue-100" : "text-gray-600"}`}>
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.popular ? "text-blue-200" : "text-blue-600"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className={`w-full ${plan.popular ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Barbers Everywhere</h2>
            <p className="text-xl text-gray-600">See what our customers have to say</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {Array(testimonial.rating).fill(0).map((_, j) => (
                        <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-6 italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800"
            alt="Barber at work"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-extrabold text-white mb-6">
              Ready to Transform Your Barbershop?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join hundreds of barbershops already using BarberPro to grow their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 text-base h-12">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 px-10 text-base h-12">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">BarberPro</span>
              </div>
              <p className="text-sm leading-relaxed">
                The complete management solution for modern barbershops. Built by barbers, for barbers.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Support", links: ["Help Center", "Contact", "Status", "Privacy Policy"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 BarberPro. All rights reserved. Built with passion for the craft.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
