import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/dashboard-page";
import { FormsPage } from "./pages/forms-page";
import { ResponsesPage } from "./pages/responses-page";
import { ProfilePage } from "./pages/profile-page";
import { PlaceholderPage } from "./pages/placeholder-page";
import { NotFoundPage } from "./pages/not-found-page";

const AuthPage = lazy(() => import("@/app/auth/page"));
const RegisterPage = lazy(() => import("@/app/auth/register/page"));
const NewFormPage = lazy(() => import("@/app/(dashboard)/forms/new/page"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center px-6">
      <p className="text-sm text-muted-foreground">Loading page...</p>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/forms/new" element={<NewFormPage />} />
        <Route path="/forms/new/ai" element={<Navigate to="/forms/new?mode=ai" replace />} />
        <Route path="/responses" element={<ResponsesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/analytics"
          element={<PlaceholderPage title="Analytics" description="Analytics route is being migrated to React Router." />}
        />
        <Route
          path="/data-upload"
          element={<PlaceholderPage title="Data Upload" description="Data upload route is being migrated to React Router." />}
        />
        <Route
          path="/ocr-upload"
          element={<PlaceholderPage title="OCR Upload" description="OCR upload route is being migrated to React Router." />}
        />
        <Route
          path="/settings"
          element={<PlaceholderPage title="Settings" description="Settings route is being migrated to React Router." />}
        />
        <Route
          path="/upgrade"
          element={<PlaceholderPage title="Upgrade" description="Upgrade route is being migrated to React Router." />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
