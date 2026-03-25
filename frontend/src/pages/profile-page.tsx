import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/src/compat/next-auth-react";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("feedmind_auth_token");
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || "Failed to load profile");
        }

        const data = (await res.json()) as Profile;
        setProfile(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load profile";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const saveApiKey = async () => {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/apikey", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey: apiKey || null }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || "Failed to save key");
      }

      setApiKey("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save key");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-6 space-y-4">
        {loading ? <p className="text-sm text-muted-foreground">Loading profile...</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="text-muted-foreground">Name:</span> {profile?.name || "-"}</p>
            <p><span className="text-muted-foreground">Email:</span> {profile?.email || "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Key</CardTitle>
            <CardDescription>Set a custom key for AI operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="api-key">Groq API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
              />
            </div>
            <Button onClick={saveApiKey} disabled={saving}>
              {saving ? "Saving..." : "Save API Key"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
