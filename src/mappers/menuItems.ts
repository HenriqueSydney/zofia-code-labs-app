export function getMenuItems(t: any) {
  return [
    {
      label: t("nav.home.title"),
      id: "home",
      href: "#home",
      ariaLabel: t("nav.home.ariaLabel"),
    },
    {
      label: t("nav.services.title"),
      id: "services",
      href: "#services",
      ariaLabel: t("nav.services.ariaLabel"),
    },
    {
      label: t("nav.about.title"),
      id: "about",
      href: "#about",
      ariaLabel: t("nav.about.ariaLabel"),
    },
    {
      label: t("nav.projects.title"),
      id: "projects",
      href: "#projects",
      ariaLabel: t("nav.projects.ariaLabel"),
    },
    {
      label: t("nav.testimonials.title"),
      id: "testimonials",
      href: "#testimonials",
      ariaLabel: t("nav.testimonials.ariaLabel"),
    },
    {
      label: t("nav.faq.title"),
      id: "faq",
      href: "#faq",
      ariaLabel: t("nav.faq.ariaLabel"),
    },
    {
      label: t("nav.contact.title"),
      id: "contact",
      href: "#contact",
      ariaLabel: t("nav.contact.ariaLabel"),
    },
  ];
}
