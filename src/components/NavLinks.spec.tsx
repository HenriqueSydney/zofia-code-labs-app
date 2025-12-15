import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mocks do Next.js ----
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// ---- Mocks dos hooks internos ----
const mockUseNavLinks = vi.fn();
const mockUseVisibleAnchor = vi.fn();

vi.mock("@/hooks/use-nav-links", () => ({
  useNavLinks: () => mockUseNavLinks(),
}));

vi.mock("@/hooks/use-visible-anchor", () => ({
  useVisibleAnchor: () => mockUseVisibleAnchor(),
}));

// ---- Import do componente depois dos mocks ----
import { NavLinks } from "./NavLinks";
import { usePathname } from "next/navigation";

describe("NavLinks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all nav items as buttons or links", () => {
    // Mock dos nav items
    mockUseNavLinks.mockReturnValue([
      { href: "home", label: "Home", type: "link" },
      { href: "#about", label: "About", type: "anchor" },
    ]);

    mockUseVisibleAnchor.mockReturnValue("#about");
    vi.mocked(usePathname).mockReturnValue("/home");

    render(<NavLinks variant="desktop" />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("should mark active anchor or link correctly", () => {
    mockUseNavLinks.mockReturnValue([
      { href: "home", label: "Home", type: "link" },
      { href: "#about", label: "About", type: "anchor" },
    ]);

    // Simula que a anchor #about está visível
    mockUseVisibleAnchor.mockReturnValue("#about");

    // pathName diferente de /home, para não ativar o link Home
    vi.mocked(usePathname).mockReturnValue("/other");

    render(<NavLinks variant="desktop" />);

    const aboutButton = screen.getByText("About");
    const homeLink = screen.getByText("Home");

    // About é ativo
    expect(aboutButton.className).toContain("text-primary");
    // Home não é ativo
    expect(homeLink.className).not.toContain("text-primary");
  });

  it("should call setIsMobileMenuOpen(false) on button click when mobile variant", () => {
    const mockSetMobile = vi.fn();

    mockUseNavLinks.mockReturnValue([
      { href: "#about", label: "About", type: "anchor" },
    ]);
    mockUseVisibleAnchor.mockReturnValue(null);
    vi.mocked(usePathname).mockReturnValue("/");

    render(<NavLinks variant="mobile" setIsMobileMenuOpen={mockSetMobile} />);

    const aboutButton = screen.getByText("About");
    fireEvent.click(aboutButton);

    expect(mockSetMobile).toHaveBeenCalledWith(false);
  });

  it("should scroll to section when anchor button is clicked", () => {
    mockUseNavLinks.mockReturnValue([
      { href: "#about", label: "About", type: "anchor" },
    ]);
    mockUseVisibleAnchor.mockReturnValue(null);
    vi.mocked(usePathname).mockReturnValue("/");

    const mockScrollIntoView = vi.fn();
    // Mock do querySelector
    const originalQuerySelector = document.querySelector;
    document.querySelector = vi.fn(() => ({
      scrollIntoView: mockScrollIntoView,
    })) as any;

    render(<NavLinks variant="desktop" />);

    const aboutButton = screen.getByText("About");
    fireEvent.click(aboutButton);

    expect(mockScrollIntoView).toHaveBeenCalled();

    // Restaura querySelector original
    document.querySelector = originalQuerySelector;
  });
});
