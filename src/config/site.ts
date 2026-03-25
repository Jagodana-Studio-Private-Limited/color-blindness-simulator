export const siteConfig = {
  name: "Color Blindness Simulator",
  title: "Color Blindness Simulator - Test Colors for Color Vision Deficiency",
  description:
    "Simulate how colors appear to people with different types of color vision deficiency. Test your designs for accessibility with 8 types of color blindness simulation.",
  url: "https://color-blindness-simulator.tools.jagodana.com",
  ogImage: "/opengraph-image",

  headerIcon: "Eye",
  brandAccentColor: "#ec4899",

  keywords: [
    "color blindness simulator",
    "color vision deficiency",
    "protanopia simulator",
    "deuteranopia simulator",
    "tritanopia simulator",
    "accessibility testing",
    "color accessibility",
    "web accessibility",
    "WCAG color contrast",
    "design accessibility tool",
    "color blind test",
    "CVD simulation",
    "color perception",
    "accessible design",
  ],
  applicationCategory: "DesignApplication",

  themeColor: "#a855f7",

  creator: "Jagodana",
  creatorUrl: "https://jagodana.com",
  twitterHandle: "@jagodana",

  socialProfiles: ["https://twitter.com/jagodana"],

  links: {
    github:
      "https://github.com/Jagodana-Studio-Private-Limited/color-blindness-simulator",
    website: "https://jagodana.com",
  },

  footer: {
    about:
      "Free online color blindness simulator helping designers and developers build more accessible products. Simulate 8 types of color vision deficiency instantly in your browser.",
    featuresTitle: "Features",
    features: [
      "8 CVD simulation types",
      "Full palette comparison grid",
      "WCAG contrast ratio checker",
      "100% client-side processing",
    ],
  },

  hero: {
    badge: "Accessibility Tool",
    titleLine1: "See Colors Through",
    titleGradient: "Different Eyes",
    subtitle:
      "Simulate how people with color blindness see your designs. Test any color palette against 8 types of color vision deficiency instantly — no uploads, 100% private.",
  },

  featureCards: [
    {
      icon: "👁️",
      title: "8 CVD Types",
      description:
        "Simulate Protanopia, Deuteranopia, Tritanopia, Achromatopsia, and 4 anomalous trichromacy variants.",
    },
    {
      icon: "🎨",
      title: "Palette Testing",
      description:
        "Test entire color palettes at once. See how your brand colors and UI elements appear to users with CVD.",
    },
    {
      icon: "🔒",
      title: "100% Private",
      description:
        "All simulations run in your browser using pure math. No colors are ever sent to any server.",
    },
  ],

  relatedTools: [
    {
      name: "Color Palette Explorer",
      url: "https://color-palette-explorer.jagodana.com",
      icon: "🎭",
      description: "Extract color palettes from any image.",
    },
    {
      name: "Favicon Generator",
      url: "https://favicon-generator.jagodana.com",
      icon: "🎨",
      description: "Generate all favicon sizes + manifest from any image.",
    },
    {
      name: "Screenshot Beautifier",
      url: "https://screenshot-beautifier.jagodana.com",
      icon: "📸",
      description: "Transform screenshots into beautiful images.",
    },
    {
      name: "Regex Playground",
      url: "https://regex-playground.jagodana.com",
      icon: "🧪",
      description: "Build, test & debug regular expressions in real-time.",
    },
    {
      name: "Sitemap Checker",
      url: "https://sitemap-checker.jagodana.com",
      icon: "🔍",
      description: "Discover and validate sitemaps on any website.",
    },
    {
      name: "Logo Maker",
      url: "https://logo-maker.jagodana.com",
      icon: "✏️",
      description: "Create a professional logo in 60 seconds.",
    },
  ],

  howToSteps: [
    {
      name: "Add Your Colors",
      text: "Enter hex color codes or use the color picker to add up to 8 colors to your palette. A default palette is pre-loaded to get you started.",
      url: "",
    },
    {
      name: "View CVD Simulations",
      text: "The tool instantly shows how your colors appear to people with each type of color vision deficiency in a side-by-side comparison grid.",
      url: "",
    },
    {
      name: "Check Contrast Ratios",
      text: "Switch to the Contrast Checker tab to see WCAG contrast ratios between any two palette colors across all CVD types.",
      url: "",
    },
    {
      name: "Copy and Apply",
      text: "Click any simulated color swatch to copy its hex code. Use these insights to refine your design for maximum accessibility.",
      url: "",
    },
  ],
  howToTotalTime: "PT1M",

  faq: [
    {
      question: "What types of color blindness does this simulator support?",
      answer:
        "The simulator supports 8 types: Protanopia (red-blind), Deuteranopia (green-blind), Tritanopia (blue-blind), Protanomaly (red-weak), Deuteranomaly (green-weak), Tritanomaly (blue-weak), Achromatopsia (total color blindness), and Achromatomaly (partial color blindness).",
    },
    {
      question: "How accurate is the color blindness simulation?",
      answer:
        "The simulation uses the Vienot, Brettel & Mollon (1999) algorithm with established RGB-to-LMS conversion matrices — the industry standard for color blindness simulation. While no simulation perfectly replicates individual experiences, these algorithms provide a scientifically validated approximation used in professional accessibility tools.",
    },
    {
      question: "Is my color data sent to any server?",
      answer:
        "No. All color calculations are performed entirely in your browser using JavaScript math. Your colors never leave your device — this tool is 100% client-side.",
    },
    {
      question: "What is the most common type of color blindness?",
      answer:
        "Deuteranomaly (green-weak) is the most common form, affecting about 5% of males. Protanomaly and Deuteranopia each affect about 1% of males. Overall, approximately 8% of males and 0.5% of females have some form of color vision deficiency.",
    },
    {
      question: "What WCAG contrast ratio should I aim for?",
      answer:
        "WCAG 2.1 requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text at Level AA. For enhanced Level AAA, aim for 7:1 for normal text and 4.5:1 for large text. Use the Contrast Checker tab to verify your ratios across different CVD types.",
    },
    {
      question: "How can I make my designs more accessible for color blind users?",
      answer:
        "Key strategies: (1) Don't rely solely on color to convey information — add patterns, icons, or labels. (2) Ensure sufficient contrast between background and foreground colors. (3) Avoid red-green color combinations, which are problematic for the most common CVD types. (4) Test your entire color palette with this simulator before publishing.",
    },
  ],

  pages: {
    "/": {
      title:
        "Color Blindness Simulator - Test Colors for Color Vision Deficiency",
      description:
        "Simulate how colors appear to people with different types of color vision deficiency. Test your designs for accessibility with 8 types of color blindness simulation.",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
