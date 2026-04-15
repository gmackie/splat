import { useState } from "react";

export function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = await response.json();

      if (!response.ok) {
        setStatus("error");
        setError(payload.error ?? "Something went wrong.");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setError("Network error. Try again in a moment.");
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">splat.gmac.io</p>
        <h1>Turn real spaces into explorable splat scenes.</h1>
        <p className="lede">
          Dronesplat is building a capture pipeline for outdoor places,
          architectural spaces, and objects. The first release is a focused
          landing page and early-access waitlist.
        </p>

        <div className="pill-row" aria-label="Core product promises">
          <span>Natural capture</span>
          <span>Architectural extraction</span>
          <span>Object scenes</span>
        </div>
      </section>

      <section className="waitlist-panel">
        <div>
          <p className="panel-kicker">Early access</p>
          <h2>Join the waitlist</h2>
          <p className="panel-copy">
            We&apos;ll use this list for launch updates, demos, and early access
            outreach.
          </p>
        </div>

        <form className="waitlist-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@gmac.io"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting..." : "Join the waitlist"}
          </button>
        </form>

        {status === "success" ? (
          <p className="success-message">You are on the list.</p>
        ) : null}
        {status === "error" ? <p className="error-message">{error}</p> : null}
      </section>
    </main>
  );
}
