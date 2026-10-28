/* ==========================================================================
   CRMO — interactions
   ========================================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------- year ---------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- mobile nav ---------------- */
  const navMenu = $("#navMenu");
  const navToggle = $("#navToggle");

  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  $$(".nav__link", navMenu).forEach((link) =>
    link.addEventListener("click", closeMenu)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });

  /* ---------------- sticky nav shadow + scrollspy ---------------- */
  const nav = $("#nav");
  const sections = $$("section[id]");
  const navLinks = $$(".nav__link");

  function onScroll() {
    nav.classList.toggle("is-stuck", window.scrollY > 10);

    // active link = section currently in the upper half of the viewport
    let current = "home";
    const marker = window.scrollY + window.innerHeight * 0.32;
    sections.forEach((sec) => {
      if (sec.offsetTop <= marker) current = sec.id;
    });
    navLinks.forEach((l) =>
      l.classList.toggle("is-active", l.getAttribute("href") === "#" + current)
    );

    // back to top
    toTop.classList.toggle("is-visible", window.scrollY > 500);
  }

  const toTop = $("#toTop");
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  /* ---------------- reveal on scroll ---------------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("is-in"), i * 70);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------------- animated counters ---------------- */
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => (el.textContent = el.dataset.count));
  }

  /* ---------------- members directory search ---------------- */
  // Sample roster drawn from CRMO's published council / board listings.
  const ROSTER = [
    { name: "Amber Bellis", creds: "DOMP, DN, DO (Spain), PhD", role: "President", city: "Vaughan, ON" },
    { name: "Dasha Veprjitska", creds: "DOMP, BSc (Ost), MBA, DO (Spain), DN", role: "Registrar", city: "Vaughan, ON" },
    { name: "Daniel Fow", creds: "DOMP", role: "Registration Committee Chair", city: "Toronto, ON" },
    { name: "Melanie Price", creds: "RMT, DOMP", role: "Fitness to Practice Chair", city: "Ottawa, ON" },
    { name: "Judy Tanko", creds: "DOMP", role: "Director of Insurance Relations", city: "Vaughan, ON" },
    { name: "Janet Maendel", creds: "BSc (Ost), DOMP", role: "Quality Assurance Chair", city: "Markham, ON" },
    { name: "Cherise Jacques", creds: "CST-T, DOMP", role: "Patient Relations Committee", city: "Thornhill, ON" },
    { name: "Dan Renaud", creds: "BPE, RMT, DOMP, PhD", role: "Discipline Committee Chair", city: "North York, ON" },
    { name: "Doug Devlin", creds: "DOM, BSc (Ost), MBA, MSc, DO, PhD", role: "Executive Committee Chair", city: "Vaughan, ON" },
    { name: "Ali Haghighi", creds: "DOMP, BSc (Ost), DO (EU)", role: "Inquiries & Reports Chair", city: "Richmond Hill, ON" },
    { name: "Angela Waller", creds: "BSc. HK, CSEP-CPT, DOMP", role: "Board Member", city: "Whitby, ON" },
    { name: "Korena Carballo", creds: "DOMP", role: "Board Member", city: "Mississauga, ON" },
    { name: "Teresa Nieman", creds: "BSc., TCMP, R.Ac, DOMP", role: "Board Member", city: "Hamilton, ON" }
  ];

  const rosterEl = $("#roster");
  const queryEl = $("#memberQuery");
  const form = $("#memberSearch");

  const initials = (n) =>
    n
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("");

  function renderRoster(list) {
    if (!rosterEl) return;
    if (!list.length) {
      rosterEl.innerHTML =
        '<li class="roster__empty">No members match that search. Try a different name, city or province.</li>';
      return;
    }
    rosterEl.innerHTML = list
      .map(
        (m, i) => `
      <li style="animation-delay:${i * 40}ms">
        <span class="roster__ava">${initials(m.name)}</span>
        <span>
          <b>${m.name}, RMO</b>
          <small>${m.creds} · ${m.role} · ${m.city}</small>
        </span>
        <span class="roster__badge">RMO</span>
      </li>`
      )
      .join("");
  }

  function filterRoster(term) {
    const t = term.trim().toLowerCase();
    const list = !t
      ? ROSTER
      : ROSTER.filter((m) =>
          [m.name, m.creds, m.role, m.city].join(" ").toLowerCase().includes(t)
        );
    renderRoster(list);
    return list.length;
  }

  if (rosterEl) {
    renderRoster(ROSTER);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      filterRoster(queryEl.value);
    });
    queryEl.addEventListener("input", () => filterRoster(queryEl.value));
    $$(".chip").forEach((chip) =>
      chip.addEventListener("click", () => {
        queryEl.value = chip.dataset.name;
        filterRoster(chip.dataset.name);
        queryEl.focus();
      })
    );
  }

  /* ---------------- contact form (front-end only) ---------------- */
  const contactForm = $("#contactForm");
  const note = $("#formNote");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const required = ["first", "last", "email", "message"];
      const missing = required.filter((k) => !String(data.get(k) || "").trim());
      const email = String(data.get("email") || "").trim();

      if (missing.length) {
        note.textContent = "Please complete all required fields.";
        note.classList.add("is-error");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.textContent = "Please enter a valid email address.";
        note.classList.add("is-error");
        return;
      }

      note.classList.remove("is-error");
      note.textContent =
        "Thank you — your message has been received. We reply within two business days.";
      contactForm.reset();
    });
  }
})();
