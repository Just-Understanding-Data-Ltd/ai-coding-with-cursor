import React from "react";
import { screen } from "@testing-library/react";
import { render } from "../test-utils";
import HomePage from "@/components/homepage/HomePage";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the config
vi.mock("@/config", () => ({
  config: {
    name: "Test App",
    homepage: {
      heroTitle: "Test Hero Title",
      heroSubtitle: "Test Hero Subtitle",
      numberOfMakersShipped: "1000+",
      painPointsSection: {
        title: "Test Pain Points",
        withoutProduct: {
          points: ["Point 1", "Point 2"],
        },
        withProduct: {
          points: ["Point 1", "Point 2"],
        },
      },
      usps: [
        {
          title: "Test USP",
          description: "Test Description",
          icon: vi.fn(),
        },
      ],
      featuresSection: {
        title: "Test Features",
        description: "Test Description",
        features: [
          {
            title: "Test Feature",
            description: "Test Description",
            image: "/test.jpg",
            icon: vi.fn(),
          },
        ],
      },
      testimonials: [
        {
          name: "Test User",
          company: "Test Company",
          quote: "Test Quote",
          imageId: 1,
        },
      ],
      ctaSection: {
        title: "Test CTA",
        description: "Test Description",
        ctaText: "Test CTA",
        ctaLink: "/test",
      },
      faqs: [
        {
          question: "Test Question",
          answer: "Test Answer",
        },
      ],
    },
  },
}));

vi.mock("lucide-react", () => ({
  X: () => <div>X Icon</div>,
  Clock: () => <div>Clock Icon</div>,
  Server: () => <div>Server Icon</div>,
  CreditCard: () => <div>CreditCard Icon</div>,
  Database: () => <div>Database Icon</div>,
  Code2: () => <div>Code2 Icon</div>,
  Code: () => <div>Code Icon</div>,
  AlertTriangle: () => <div>AlertTriangle Icon</div>,
  TestTube: () => <div>TestTube Icon</div>,
  Search: () => <div>Search Icon</div>,
  BarChart: () => <div>BarChart Icon</div>,
  Sun: () => <div>Sun Icon</div>,
  Newspaper: () => <div>Newspaper Icon</div>,
  LayoutDashboard: () => <div>LayoutDashboard Icon</div>,
  Settings2: () => <div>Settings2 Icon</div>,
  Users: () => <div>Users Icon</div>,
  Building2: () => <div>Building2 Icon</div>,
  FileText: () => <div>FileText Icon</div>,
  ChevronRight: () => <div>ChevronRight Icon</div>,
  ChevronDown: () => <div>ChevronDown Icon</div>,
  Menu: () => <div>Menu Icon</div>,
  Moon: () => <div>Moon Icon</div>,
  XCircle: () => <div>XCircle Icon</div>,
  CheckCircle: () => <div>CheckCircle Icon</div>,
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

// Mock the components
vi.mock("@/components/homepage/HeroSection", () => ({
  default: ({
    title,
    subtitle,
    ctaLink,
    ctaText,
  }: {
    title: string;
    subtitle: string;
    ctaLink: string;
    ctaText: string;
  }) => (
    <div data-testid="hero-section">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button>{ctaText}</button>
    </div>
  ),
}));

vi.mock("@/components/homepage/PainPointsSection", () => ({
  default: () => (
    <div data-testid="pain-points-section">Pain Points Section</div>
  ),
}));

vi.mock("@/components/homepage/USPSection", () => ({
  default: () => <div data-testid="usp-section">USP Section</div>,
}));

vi.mock("@/components/homepage/FeaturesSection", () => ({
  default: () => <div data-testid="features-section">Features Section</div>,
}));

vi.mock("@/components/homepage/TestimonialSection", () => ({
  default: () => (
    <div data-testid="testimonial-section">Testimonial Section</div>
  ),
}));

vi.mock("@/components/homepage/CTASection", () => ({
  default: () => <div data-testid="cta-section">CTA Section</div>,
}));

vi.mock("@/components/homepage/FAQSection", () => ({
  default: () => <div data-testid="faq-section">FAQ Section</div>,
}));

describe("HomePage Rendering", () => {
  beforeEach(() => {
    render(<HomePage />);
  });

  it("renders correctly", () => {
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  it("renders HeroSection", () => {
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
  });

  it("renders PainPointsSection", () => {
    expect(screen.getByTestId("pain-points-section")).toBeInTheDocument();
  });

  it("renders USPSection", () => {
    expect(screen.getByTestId("usp-section")).toBeInTheDocument();
  });

  it("renders FeaturesSection", () => {
    expect(screen.getByTestId("features-section")).toBeInTheDocument();
  });

  it("renders TestimonialSection", () => {
    expect(screen.getByTestId("testimonial-section")).toBeInTheDocument();
  });

  it("renders CTASection", () => {
    expect(screen.getByTestId("cta-section")).toBeInTheDocument();
  });

  it("renders FAQSection", () => {
    expect(screen.getByTestId("faq-section")).toBeInTheDocument();
  });
});
