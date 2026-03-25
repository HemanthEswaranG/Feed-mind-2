import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/shared/navbar";
import { MyFormsClient } from "@/components/forms/my-forms-client";
import { useSession } from "@/src/compat/next-auth-react";

type RawForm = {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: Array<unknown>;
  _count?: { responses?: number };
};

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("feedmind_auth_token");
}

export function FormsPage() {
  const navigate = useNavigate();
  const { status } = useSession();
  const [forms, setForms] = useState<RawForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/auth", { replace: true });
    }
  }, [status, navigate]);

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/forms", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || "Failed to load forms");
        }

        const data = (await res.json()) as RawForm[];
        setForms(Array.isArray(data) ? data : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load forms";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const mapped = useMemo(
    () =>
      forms.map((form) => ({
        id: form.id,
        title: form.title,
        description: form.description,
        isPublished: form.isPublished,
        questionCount: form.questions?.length ?? 0,
        responseCount: form._count?.responses ?? 0,
        spamCount: 0,
        createdAt: new Date(form.createdAt),
        updatedAt: new Date(form.updatedAt),
      })),
    [forms]
  );

  const totalResponses = mapped.reduce((sum, form) => sum + form.responseCount, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-6">
        {loading ? <p className="text-sm text-muted-foreground">Loading forms...</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {!loading ? <MyFormsClient forms={mapped} totalResponses={totalResponses} /> : null}
      </main>
    </div>
  );
}
