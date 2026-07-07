export type DemoPersona = {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  hairGradient: [string, string];
  hair: "afro" | "short" | "long" | "cap";
  glasses: boolean;
  script: string;
  audioSrc: string;
};

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: "chaleureux",
    name: "Chaleureux",
    tagline: "Restaurants & commerces gourmands",
    accent: "#fb923c",
    hairGradient: ["#fb923c", "#c2410c"],
    hair: "afro",
    glasses: false,
    script:
      "Bonjour et bienvenue chez Le Petit Comptoir ! Je peux prendre votre réservation ou répondre à vos questions sur le menu. Comment puis-je vous aider ?",
    audioSrc: "/demo/samples/chaleureux.mp3",
  },
  {
    id: "elegant",
    name: "Élégant",
    tagline: "Salons de coiffure & instituts",
    accent: "#c084fc",
    hairGradient: ["#c084fc", "#7e22ce"],
    hair: "long",
    glasses: false,
    script:
      "Bonjour, vous êtes bien chez Studio Coiffure. Souhaitez-vous prendre rendez-vous ou avez-vous une question sur nos prestations ?",
    audioSrc: "/demo/samples/elegant.mp3",
  },
  {
    id: "efficace",
    name: "Direct & efficace",
    tagline: "Artisans & professionnels du bâtiment",
    accent: "#60a5fa",
    hairGradient: ["#60a5fa", "#1d4ed8"],
    hair: "short",
    glasses: true,
    script: "Bonjour, agence Dupont Plomberie, je vous écoute. Devis, intervention urgente, ou autre chose ?",
    audioSrc: "/demo/samples/efficace.mp3",
  },
  {
    id: "dynamique",
    name: "Dynamique",
    tagline: "Commerces jeunes & tendance",
    accent: "#f472b6",
    hairGradient: ["#f472b6", "#be185d"],
    hair: "cap",
    glasses: false,
    script:
      "Hello, bienvenue chez Fit Club ! Rendez-vous, question sur nos cours, ou autre chose, je suis là pour vous aider !",
    audioSrc: "/demo/samples/dynamique.mp3",
  },
];
