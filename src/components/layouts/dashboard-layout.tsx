"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Anchor, LogOut, Moon, Shield, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { CompanySwitcher } from "@/components/auth/company-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/i18n";

interface DashboardLayoutProps {
  children: React.ReactNode;
  company: string;
  companyName?: string;
  companyLogo?: string | null;
  userName?: string;
  userRole?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Rest Hours",
    href: "/dashboard/rest-hours",
    icon: Anchor,
  },
];

export function DashboardLayout({
  children,
  company,
  companyName = "Company",
  companyLogo = null,
  userName = "User",
  userRole = "Employee",
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const activeNavHref = React.useMemo(() => {
    const fullMatch = navItems.find((item) => pathname === `/${company}${item.href}`);
    if (fullMatch) return fullMatch.href;

    const nestedMatch = navItems.find((item) =>
      pathname === `/${company}${item.href}` || pathname.startsWith(`/${company}${item.href}/`)
    );

    return nestedMatch?.href ?? navItems[0]?.href ?? "";
  }, [company, pathname]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 px-4 pt-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3 pb-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                {companyLogo ? (
                  <Image
                    src={companyLogo}
                    alt={`${companyName} logo`}
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded object-contain"
                    unoptimized
                  />
                ) : (
                  <Shield className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
                )}
                <span className="truncate text-lg font-semibold">{companyName}</span>
              </Link>
              <CompanySwitcher />
            </div>
          </div>

          <nav aria-label="Dashboard navigation" className="mx-auto self-end">
            <div className="flex items-end gap-6">
              {navItems.map((item) => {
                const href = `/${company}${item.href}`;
                const isActive = activeNavHref === item.href;
                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={cn(
                      "inline-flex h-12 items-center gap-2 border-b-2 -mb-px px-1 text-sm font-medium transition-colors",
                      isActive
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="flex items-center gap-2 pb-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => void logout()}
              aria-label={t("common.signOut")}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-6">{children}</main>
    </div>
  );
}
