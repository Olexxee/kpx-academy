import { Outlet } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-neutral">
      <SiteHeader />

      <main id="main-content" className="min-w-0 flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
};
