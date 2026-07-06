export default function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Staro.app",
    url: "https://www.staro.app",
    description: "Agent vocal IA qui répond au téléphone pour les commerces locaux, 24/7.",
    logo: "https://www.staro.app/opengraph-image",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
