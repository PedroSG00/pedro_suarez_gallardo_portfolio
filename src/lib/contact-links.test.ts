import { expect, test } from "vitest";
import { buildContactLinks } from "@/lib/contact-links";

const SITE = {
  email: "contact@example.com",
  linkedinUrl: "https://example.com/linkedin",
  githubUrl: "https://example.com/github",
  cvPath: { en: "/cv-en.pdf", es: "/cv-es.pdf" },
};

const LOCALES = [
  {
    locale: "en",
    labels: {
      email: "Email",
      linkedin: "LinkedIn",
      github: "GitHub",
      cv: "CV",
      newTab: "opens in a new tab",
    },
    cvHref: "/cv-en.pdf",
  },
  {
    locale: "es",
    labels: {
      email: "Correo",
      linkedin: "LinkedIn",
      github: "GitHub",
      cv: "Currículum",
      newTab: "se abre en una pestaña nueva",
    },
    cvHref: "/cv-es.pdf",
  },
] as const;

const PLACEMENTS = ["contact", "footer"] as const;

test.each(
  LOCALES.flatMap((row) => PLACEMENTS.map((placement) => ({ ...row, placement }))),
)("resolves $locale links for $placement", ({ locale, labels, cvHref, placement }) => {
  const links = buildContactLinks(locale, placement, SITE, labels);
  const announcement = placement === "footer" ? { srLabel: labels.newTab } : {};

  expect(links).toHaveLength(4);
  expect(Object.fromEntries(links.map((link) => [link.channel, link]))).toStrictEqual({
    email: { channel: "email", label: labels.email, href: "mailto:contact@example.com", target: "_self" },
    linkedin: { channel: "linkedin", label: "LinkedIn", href: SITE.linkedinUrl, target: "_blank", ...announcement },
    github: { channel: "github", label: "GitHub", href: SITE.githubUrl, target: "_blank", ...announcement },
    cv: { channel: "cv", label: labels.cv, href: cvHref, target: "_blank", ...announcement },
  });
});

const INCOMPLETE_DESTINATIONS = [
  { channel: "email", override: { email: "" }, locale: "en" },
  { channel: "linkedin", override: { linkedinUrl: "" }, locale: "en" },
  { channel: "github", override: { githubUrl: " " }, locale: "en" },
  { channel: "cv", override: { cvPath: { es: "/cv-es.pdf" } }, locale: "en" },
  { channel: "cv", override: { cvPath: { en: "/cv-en.pdf" } }, locale: "es" },
  { channel: "cv", override: { cvPath: { en: "", es: "/cv-es.pdf" } }, locale: "en" },
] as const;

test.each(
  INCOMPLETE_DESTINATIONS.flatMap((row) => PLACEMENTS.map((placement) => ({ ...row, placement }))),
)("omits only the incomplete $channel link for $locale in $placement", ({
  channel,
  locale,
  override,
  placement,
}) => {
  const labels = locale === "en" ? LOCALES[0].labels : LOCALES[1].labels;
  const complete = buildContactLinks(locale, placement, SITE, labels);
  const links = buildContactLinks(locale, placement, { ...SITE, ...override }, labels);

  expect(links).toHaveLength(3);
  expect(links).toEqual(
    expect.arrayContaining(complete.filter((link) => link.channel !== channel)),
  );
});
