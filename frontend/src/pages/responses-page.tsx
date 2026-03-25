import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/src/compat/next-auth-react";
import { Navbar } from "@/components/shared/navbar";
import { ResponsesPageClient } from "@/app/(dashboard)/responses/client";
import { getAllResponses } from "@/server/actions/responses";

type ResponseRow = {
  id: string;
  formId: string;
  formTitle: string;
  submittedAt: string;
  integrityScore: number | null;
  sentimentScore: number | null;
  isSpam: boolean;
  isFlagged: boolean;
  respondent: string;
  preview: string;
  answers: Array<{
    questionId: string;
    questionLabel: string;
    questionType: string;
    value: string;
  }>;
};

export function ResponsesPage() {
  const navigate = useNavigate();
  const { status } = useSession();
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/auth", { replace: true });
    }
  }, [status, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = (await getAllResponses()) as ResponseRow[];
        setResponses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load responses");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const forms = Array.from(
    new Map(responses.map((r) => [r.formId, { id: r.formId, title: r.formTitle }])).values()
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-6">
        {loading ? <p className="text-sm text-muted-foreground">Loading responses...</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {!loading ? <ResponsesPageClient responses={responses} forms={forms} /> : null}
      </main>
    </div>
  );
}
