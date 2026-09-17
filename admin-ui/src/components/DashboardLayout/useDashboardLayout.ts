import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { copy } from "../../copy";

type NavLinkItem = {
  to: string;
  label: string;
  /** Only shown to SUPER_ADMIN. */
  superAdminOnly?: boolean;
};

type NavSection = {
  id: string;
  label?: string;
  items: NavLinkItem[];
};

/** Logical order: overview → people → research → facilities → content. */
const NAV_SECTIONS: NavSection[] = [
  {
    id: "overview",
    items: [{ to: "/", label: copy.dashboard }],
  },

  {
    id: "research",
    label: copy.navResearch,
    items: [
      { to: "/projects", label: copy.projects },
      { to: "/proposals", label: copy.proposals },
    ],
  },
  {
    id: "people",
    label: copy.navPeople,
    items: [
      { to: "/users", label: copy.users },
      { to: "/admins", label: copy.admins, superAdminOnly: true },
    ],
  },
  {
    id: "facilities",
    label: copy.navFacilities,
    items: [
      { to: "/installations", label: copy.installations },
      { to: "/instruments", label: copy.instruments },
    ],
  },
  {
    id: "content",
    label: copy.navContent,
    items: [
      { to: "/publications", label: copy.publications },
      { to: "/invitations", label: copy.invitations },
    ],
  },
];

function titleForPath(pathname: string): string {
  if (pathname.startsWith("/admins")) return copy.admins;
  if (pathname.startsWith("/users")) return copy.users;
  if (pathname.startsWith("/projects")) return copy.projects;
  if (pathname.startsWith("/proposals")) return copy.proposals;
  if (pathname.startsWith("/installations")) return copy.installations;
  if (pathname.startsWith("/instruments")) return copy.instruments;
  if (pathname.startsWith("/publications")) return copy.publications;
  if (pathname.startsWith("/invitations")) return copy.invitations;
  return copy.dashboard;
}

/** Sidebar shell state for the admin dashboard. */
export function useDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isSuperAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function toggleSidebar() {
    setSidebarOpen((v) => !v);
  }

  async function onLogout() {
    closeSidebar();
    await logout();
    navigate("/login", { replace: true });
  }

  const sections = useMemo(() => {
    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.superAdminOnly || isSuperAdmin,
      ),
    })).filter((section) => section.items.length > 0);
  }, [isSuperAdmin]);

  return {
    copy,
    user,
    sidebarOpen,
    closeSidebar,
    toggleSidebar,
    onLogout,
    activePath: location.pathname,
    sections,
    pageTitle: titleForPath(location.pathname),
  };
}
