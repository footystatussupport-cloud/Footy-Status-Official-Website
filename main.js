(() => {
  "use strict";

  /* ------------------------------- Icon helper ------------------------------- */

  const icon = (paths, viewBox = "0 0 24 24") =>
    `<svg width="22" height="22" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

  const ICONS = {
    profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1"/>',
    clip: '<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M21 8l-4 3 4 3V8z"/>',
    feed: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/>',
    family: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 21v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5"/><path d="M14.5 20v-.8a4 4 0 0 1 3-3.8"/>',
    whistle: '<circle cx="9" cy="15" r="5"/><path d="M14 12h4a3 3 0 0 0 3-3V7h-6"/><path d="M14 9v2"/>',
    team: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    building: '<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17"/><path d="M9 21v-4h6v4"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    referee: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1"/><path d="M12 4l1 2-1 2-1-2z"/>',
    league: '<path d="M4 22V4a1 1 0 0 1 1-1h9l6 6v13"/><path d="M14 3v6h6"/>',
    fixtures: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    stats: '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    gender: '<circle cx="12" cy="9" r="5"/><path d="M12 14v8M9 19h6"/>',
    admin: '<path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z"/><path d="M9 12l2 2 4-4"/>',
    shield: '<path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z"/>',
    flag: '<path d="M4 22V4"/><path d="M4 4h13l-2 4 2 4H4"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    check2: '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M10.5 12.5L20 3M17 6l3 3M14 9l3 3"/>',
  };

  /* --------------------------------- Feature data ------------------------------- */

  const FEATURES = [
    ["profile", "Custom Soccer Profiles", "Personalized profiles for every account type — players, coaches, teams, scouts, referees, and leagues."],
    ["clip", "Player Highlight Clips", "Upload and showcase short highlight clips that capture your best moments on the pitch."],
    ["feed", "The Next Up Video Feed", "A vertical highlight feed built for discovery, so emerging talent can be seen and followed."],
    ["link", "Team &amp; Player Connections", "Players connect with teams, and teams build rosters of connected players and staff."],
    ["family", "Parent &amp; Child Account Linking", "Parents can link directly to their children's profiles to follow their soccer journey."],
    ["whistle", "Coach &amp; Staff Profiles", "Coaches and staff showcase experience and stay connected to their clubs or school teams."],
    ["building", "Team &amp; Academy Profiles", "Central hubs for organizations to display rosters, staff, fixtures, and results."],
    ["search", "Scout Discovery Tools", "Purpose-built tools that help scouts search for and evaluate emerging talent."],
    ["referee", "Referee Profiles", "Professional profiles that help referees build visibility within the soccer community."],
    ["league", "League Pages", "Dedicated pages for leagues to showcase participating teams and organization details."],
    ["fixtures", "Fixtures &amp; Recent Results", "Stay current with upcoming matches, schedules, and recently completed results."],
    ["stats", "Player Statistics", "Track key statistics that reflect a player's development and performance over time."],
    ["bell", "Notifications &amp; Invitations", "Stay in the loop with connection requests, invitations, and important account updates."],
    ["compass", "Search &amp; Discovery", "Find players, teams, leagues, coaches, scouts, and referees across the platform."],
    ["gender", "Gender-Aware Visibility", "Gender-aware player visibility and feed recommendations for more relevant discovery."],
    ["admin", "Administrative Tools", "Dedicated tools for approved Footy Status administrators to help manage the community."],
  ];

  const ACCOUNTS = [
    ["profile", "Players", "Build a soccer profile, connect with teams, upload highlights, track statistics, and gain exposure."],
    ["family", "Parents", "Connect with your child's profile, follow their soccer journey, and receive important notifications."],
    ["whistle", "Coaches &amp; Staff", "Show your coaching experience, connect with teams, and manage your professional soccer presence."],
    ["building", "Teams &amp; Academies", "Create a central profile for your organization, display teams, staff, fixtures, results, jersey colors, home fields, and important updates."],
    ["search", "Scouts", "Search for players, explore highlights, and discover emerging talent."],
    ["referee", "Referees", "Create a professional referee profile and become more visible within the soccer community."],
    ["league", "Leagues", "Connect participating teams, display league information, organize fixtures, and share recent results."],
  ];

  const SAFETY = [
    ["shield", "Content Moderation", "Uploaded content is subject to moderation to help maintain a respectful community."],
    ["flag", "Report &amp; Review Tools", "Users can report content or accounts for administrative review."],
    ["family", "Parent &amp; Child Connections", "Parents can link with their children's accounts to stay involved and informed."],
    ["eye", "Controlled Account Visibility", "Visibility settings help users manage who can see their profile and activity."],
    ["shield", "Age-Appropriate Protections", "Account experiences are designed with age-appropriate protections in mind."],
    ["filter", "Profanity Filtering", "Automated filtering helps reduce inappropriate language across the platform."],
    ["check2", "Administrative Review", "Reported content is reviewed by the Footy Status team."],
    ["key", "Secure Account Authentication", "Accounts are protected with secure authentication practices."],
  ];

  const FAQS = [
    ["What is Footy Status?", "Footy Status is a soccer platform that connects players, parents, coaches, teams, scouts, referees, and leagues in one place — with profiles, highlights, team connections, fixtures, and results."],
    ["Who can create an account?", "Players, parents, coaches and staff, teams and academies, scouts, and referees can all create an account that matches their role in the soccer community."],
    ["When will Footy Status launch?", "Footy Status is currently in development. Join the waitlist to be notified as soon as the app becomes available."],
    ["Will Footy Status be available on iPhone and Android?", "Yes. Footy Status is planned for release on both the Apple App Store and Google Play."],
    ["Is Footy Status free?", "Yes. Footy Status is free to join for every account type. Footy Status Pro is an optional upgrade available to player accounts."],
    ["What is included with Footy Status Pro?", "Footy Status Pro includes unlimited active highlight clips, clips up to 45 seconds, no advertisements, increased visibility in the Next Up feed, and a Pro profile badge."],
    ["Who can purchase Footy Status Pro?", "Only player accounts are eligible to purchase Footy Status Pro."],
    ["How do players connect with teams?", "Players can search for and connect with their teams directly within the app, and teams can accept or manage those connections."],
    ["How do parents connect with their children?", "Parents can link their account with their child's player profile to follow their soccer journey and receive relevant notifications."],
    ["How can a league partner with Footy Status?", "Leagues interested in partnering can reach out through the Paired Leagues section or the contact form to start the conversation."],
    ["How are clips reviewed?", "Clips uploaded to the Next Up feed may be reviewed before appearing publicly to help maintain a safe and high-quality community."],
    ["How can users report inappropriate content?", "Footy Status includes report and review tools so users can flag inappropriate content or behavior for administrative review."],
  ];

  /* --------------------------------- Renderers ------------------------------- */

  function renderFeatureGrid() {
    const el = document.getElementById("featureGrid");
    if (!el) return;
    el.innerHTML = FEATURES.map(([iconKey, title, desc]) => `
      <div class="feature-card reveal">
        <div class="feature-icon">${icon(ICONS[iconKey])}</div>
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
    `).join("");
  }

  function renderAccountGrid() {
    const el = document.getElementById("accountGrid");
    if (!el) return;
    el.innerHTML = ACCOUNTS.map(([iconKey, title, desc]) => `
      <div class="account-card reveal">
        <div class="account-icon">${icon(ICONS[iconKey])}</div>
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
    `).join("");
  }

  function renderSafetyGrid() {
    const el = document.getElementById("safetyGrid");
    if (!el) return;
    el.innerHTML = SAFETY.map(([iconKey, title, desc]) => `
      <div class="safety-card reveal">
        <div class="icon">${icon(ICONS[iconKey], "0 0 24 24")}</div>
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
    `).join("");
  }

  function renderFaq() {
    const el = document.getElementById("faqList");
    if (!el) return;
    el.innerHTML = FAQS.map(([q, a], i) => `
      <div class="faq-item reveal" data-index="${i}">
        <button class="faq-q" aria-expanded="false" aria-controls="faqAnswer${i}" id="faqQuestion${i}">
          <span>${q}</span>
          <span class="plus" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </span>
        </button>
        <div class="faq-a" id="faqAnswer${i}" role="region" aria-labelledby="faqQuestion${i}">
          <p>${a}</p>
        </div>
      </div>
    `).join("");

    el.querySelectorAll(".faq-q").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const answer = item.querySelector(".faq-a");
        const isOpen = item.classList.contains("open");

        el.querySelectorAll(".faq-item.open").forEach((openItem) => {
          if (openItem !== item) {
            openItem.classList.remove("open");
            openItem.querySelector(".faq-q").setAttribute("aria-expanded", "false");
            openItem.querySelector(".faq-a").style.maxHeight = null;
          }
        });

        item.classList.toggle("open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
        answer.style.maxHeight = isOpen ? null : answer.scrollHeight + "px";
      });
    });
  }

  /* ----------------------------------- Stars ----------------------------------- */

  const STAR_SVG = {
    STAR_RED: '<svg viewBox="0 0 24 24" fill="#e02138"><polygon points="12 2 14.9 9.1 22.5 9.5 16.5 14.3 18.6 21.5 12 17.3 5.4 21.5 7.5 14.3 1.5 9.5 9.1 9.1"/></svg>',
    STAR_ROYAL: '<svg viewBox="0 0 24 24" fill="#235ed1"><polygon points="12 2 14.9 9.1 22.5 9.5 16.5 14.3 18.6 21.5 12 17.3 5.4 21.5 7.5 14.3 1.5 9.5 9.1 9.1"/></svg>',
    STAR_NAVY: '<svg viewBox="0 0 24 24" fill="#0a1a3c"><polygon points="12 2 14.9 9.1 22.5 9.5 16.5 14.3 18.6 21.5 12 17.3 5.4 21.5 7.5 14.3 1.5 9.5 9.1 9.1"/></svg>',
    STAR_WHITE: '<svg viewBox="0 0 24 24" fill="#ffffff"><polygon points="12 2 14.9 9.1 22.5 9.5 16.5 14.3 18.6 21.5 12 17.3 5.4 21.5 7.5 14.3 1.5 9.5 9.1 9.1"/></svg>',
  };

  function renderStars() {
    document.querySelectorAll(".star").forEach((star) => {
      const key = star.textContent.trim();
      if (STAR_SVG[key]) star.innerHTML = STAR_SVG[key];
    });
  }

  /* ------------------------------------ Nav ------------------------------------ */

  function initNav() {
    const navbar = document.getElementById("navbar");
    const toggle = document.getElementById("navToggle");
    const panel = document.getElementById("mobilePanel");

    window.addEventListener("scroll", () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 8);
    }, { passive: true });

    toggle.addEventListener("click", () => {
      const isOpen = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* -------------------------------- Reveal on scroll ----------------------------- */

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach((el) => observer.observe(el));
  }

  /* --------------------------------- Forms -------------------------------------- */

  function initWaitlistForm() {
    const form = document.getElementById("waitlistForm");
    const success = document.getElementById("waitlistSuccess");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      // TODO: connect to email platform / database once available.
      form.classList.add("hide");
      success.classList.add("show");
    });
  }

  function initContactForm() {
    const form = document.getElementById("contactForm");
    const success = document.getElementById("contactSuccess");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      // TODO: connect to support inbox / CRM once available.
      success.classList.add("show");
      form.reset();
    });
  }

  /* ---------------------------------- Init --------------------------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    renderFeatureGrid();
    renderAccountGrid();
    renderSafetyGrid();
    renderFaq();
    renderStars();
    initNav();
    initReveal();
    initWaitlistForm();
    initContactForm();
  });
})();
