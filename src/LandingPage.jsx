import { useEffect, useState } from "react";

const COMPACT_WAITLIST_BREAKPOINT = 1380;
const COMPACT_WAITLIST_HEIGHT_BREAKPOINT = 900;

function shouldUseCompactWaitlistLayout() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.innerWidth < COMPACT_WAITLIST_BREAKPOINT ||
    window.innerHeight < COMPACT_WAITLIST_HEIGHT_BREAKPOINT
  );
}

export function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [isCompactWaitlistLayout, setIsCompactWaitlistLayout] = useState(() =>
    shouldUseCompactWaitlistLayout()
  );

  useEffect(() => {
    function handleResize() {
      setIsCompactWaitlistLayout(shouldUseCompactWaitlistLayout());
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
      <div className="atmosphere-grid" aria-hidden="true">
        <span className="atmosphere-orb atmosphere-orb-sunrise" />
        <span className="atmosphere-orb atmosphere-orb-moss" />
        <span className="atmosphere-lines" />
      </div>

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">splat.gmac.io / early terrain capture</p>
          <h1>Wild places deserve a better memory.</h1>
          <p className="lede">
            Splat turns hikes, cabins, lookout towers, strange rooms, and found
            objects into scenes you can step back into. Built for people who
            chase light, save every pin, and want their field notes to feel
            alive instead of flat.
          </p>
        </div>

        <div className="hero-rail">
          <p className="subhead">
            For hikers, artists, and obsessive note-takers.
          </p>

          <div className="pill-row" aria-label="Core product promises">
            <span>ridge runs</span>
            <span>cabin scans</span>
            <span>trail diaries</span>
            <span>object drops</span>
          </div>

          <div className="signal-grid" aria-label="Why splat feels different">
            <article>
              <p className="signal-label">Field note</p>
              <h2>Keep the weather in it.</h2>
              <p>
                Less sterile map, more atmosphere. Capture the overlook, the
                fog, the clutter, the mood.
              </p>
            </article>

            <article>
              <p className="signal-label">Creative tool</p>
              <h2>Scout once, revisit anytime.</h2>
              <p>
                Useful for storyboarding, reference gathering, design work, and
                remembering where the magic actually was.
              </p>
            </article>

            <article>
              <p className="signal-label">Scene archive</p>
              <h2>Make your wanderings explorable.</h2>
              <p>
                Build a personal library of places that still feel tactile long
                after the trail dust is gone.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        className={`waitlist-panel${isCompactWaitlistLayout ? " waitlist-panel-compact" : ""}`}
      >
        <div className="waitlist-copy">
          <p className="panel-kicker">Trailhead access</p>
          <h2>Claim a spot on the first drop.</h2>
          <p className="panel-copy">
            We&apos;ll use this list for launch drops, demo invites, and early
            beta access. No spam, no generic growth sludge.
          </p>
        </div>

        <form className="waitlist-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@trailmail.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting..." : "Claim a waitlist spot"}
          </button>
        </form>

        <p className="form-note">
          First invites will go to people documenting outdoor places, strange
          spaces, and visual references they actually care about.
        </p>

        {status === "success" ? (
          <p className="success-message">You are on the list.</p>
        ) : null}
        {status === "error" ? <p className="error-message">{error}</p> : null}
      </section>

      <section className="story-strip" aria-label="Scene qualities">
        <div>
          <p className="story-label">01</p>
          <h2>Archive the hike.</h2>
          <p>Not just the route. The switchback light, the weird rock, the stop-you-in-place view.</p>
        </div>
        <div>
          <p className="story-label">02</p>
          <h2>Save the reference.</h2>
          <p>For shoots, moodboards, build ideas, location scouting, and stories you are not done with yet.</p>
        </div>
        <div>
          <p className="story-label">03</p>
          <h2>Replay the scene.</h2>
          <p>Open a place again and feel where you were standing when it clicked.</p>
        </div>
      </section>
    </main>
  );
}
