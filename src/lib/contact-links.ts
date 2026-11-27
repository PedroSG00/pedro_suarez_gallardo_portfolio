type ContactLocale = "en" | "es";
type ContactPlacement = "contact" | "footer";
type ContactChannel = "email" | "linkedin" | "github" | "cv";

interface ContactDestinations {
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  cvPath: Partial<Record<ContactLocale, string>>;
}

type ContactLabels = Record<ContactChannel, string> & { newTab: string };

export interface ContactLink {
  channel: ContactChannel;
  label: string;
  href: string;
  target: "_self" | "_blank";
  srLabel?: string;
}

export function buildContactLinks(
  locale: ContactLocale,
  placement: ContactPlacement,
  site: ContactDestinations,
  labels: ContactLabels,
): ContactLink[] {
  const destinations: [ContactChannel, string | undefined][] = [
    ["email", site.email],
    ["linkedin", site.linkedinUrl],
    ["github", site.githubUrl],
    ["cv", site.cvPath[locale]],
  ];

  return destinations.flatMap(([channel, destination]): ContactLink[] => {
    const address = destination?.trim();
    if (!address) return [];

    const label = labels[channel];
    if (channel === "email") {
      return [{ channel, label, href: `mailto:${address}`, target: "_self" }];
    }

    const link: ContactLink = { channel, label, href: address, target: "_blank" };
    if (placement === "footer") link.srLabel = labels.newTab;
    return [link];
  });
}
