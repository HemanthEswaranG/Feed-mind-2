import { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams as useRRSearchParams } from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
  };
}

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParams() {
  const [params] = useRRSearchParams();
  return params;
}

export function redirect(href: string): never {
  window.location.assign(href);
  throw new Error("Redirecting");
}

export function notFound(): never {
  window.location.assign("/404");
  throw new Error("Not found");
}

export function useParams() {
  const location = useLocation();
  return useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    return { formId: parts[1] ?? "" };
  }, [location.pathname]);
}
