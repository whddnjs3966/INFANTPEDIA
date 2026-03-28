"use client";

console.log("CACHE BUSTER ADMIN LAYOUT v3");

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === "/admin/login") {
      setChecking(false);
      setAuthenticated(true);
      return;
    }

    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/session");
        if (res.ok) {
          setAuthenticated(true);
        } else {
          router.replace("/admin/login");
        }
      } catch {
        router.replace("/admin/login");
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-spinner" />
      </div>
    );
  }

  if (!authenticated) return null;

  return <>{children}</>;
}
