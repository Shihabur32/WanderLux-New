/* =========================================================
   WanderLux Travel Agency - main.js
   ICT502 Assessment 2
   Sections: 1 Config | 2 Navigation | 3 Slider | 4 Scroll reveal
             5 Validation helpers | 6 Email sending | 7 Calculator
   ========================================================= */
"use strict";

/* ---------- 1. CONFIG ----------
   Contact/appointment forms send real emails through Web3Forms (free).
   1) Go to https://web3forms.com, enter your email, get an Access Key.
   2) Paste it below. No backend needed, works on GitHub Pages/Netlify. */
   const EMAILJS_PUBLIC_KEY  = "MKAt1r6B3OLsjGPRE";
   const EMAILJS_SERVICE_ID  = "service_3nayfcl";
   const EMAILJS_TEMPLATE_ID = "template_1pu2cb7";
const WEB3FORMS_URL = "https://api.web3forms.com/submit";

/* Calculator preset rates (USD) */
const DESTINATIONS = {
  Bali:       { daily: 85,  hotel: 70,  img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=75" },
  Paris:      { daily: 160, hotel: 190, img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=75" },
  Maldives:   { daily: 210, hotel: 320, img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=75" },
  Tokyo:      { daily: 140, hotel: 150, img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=75" },
  Dubai:      { daily: 150, hotel: 170, img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=75" },
  Santorini:  { daily: 170, hotel: 210, img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=75" },
  Goa:        { daily: 55,  hotel: 45,  img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=75" },
  Singapore:  { daily: 130, hotel: 140, img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=75" }
};
const STYLE_MULTIPLIER = { Budget: 0.75, Standard: 1, Luxury: 1.9 };
const PACKAGE_NAME = { Budget: "Budget Travel Package", Standard: "Standard Travel Package", Luxury: "Luxury Travel Package" };

/* Helper: shorthand selectors */
const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ---------- 2. NAVIGATION, FOOTER YEAR, BACK-TO-TOP ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = $(".nav-toggle");
  const links = $(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    $$("a", links).forEach(a => a.addEventListener("click", () => {
      links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
    }));
  }

  const year = $("#year"); if (year) year.textContent = new Date().getFullYear();

  const topBtn = $(".to-top");
  if (topBtn) {
    window.addEventListener("scroll", () => topBtn.classList.toggle("show", window.scrollY > 500), { passive: true });
    topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* If a photo fails to load, hide it - the gradient behind it takes over */
  $$("img").forEach(img => img.addEventListener("error", () => { img.style.visibility = "hidden"; }));

  initSlider();
  initReveal();
  initCounters();
  initForms();
  initCalculator();
});

/* ---------- 3. HERO SLIDER (rotating banner) ---------- */
function initSlider() {
  const hero = $(".hero");
  if (!hero) return;
  const slides = $$(".slide", hero);
  const dotsWrap = $(".dots", hero);
  let index = 0, timer;

  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.className = "dot"; d.setAttribute("aria-label", `Go to slide ${i + 1}`);
    d.addEventListener("click", () => { show(i); restart(); });
    dotsWrap.appendChild(d);
  });
  const dots = $$(".dot", hero);

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => { s.classList.toggle("active", n === index); s.setAttribute("aria-hidden", n !== index); });
    dots.forEach((d, n) => d.classList.toggle("active", n === index));
  }
  function restart() { clearInterval(timer); timer = setInterval(() => show(index + 1), 5500); }

  $(".slider-btn.next", hero).addEventListener("click", () => { show(index + 1); restart(); });
  $(".slider-btn.prev", hero).addEventListener("click", () => { show(index - 1); restart(); });
  hero.addEventListener("mouseenter", () => clearInterval(timer));
  hero.addEventListener("mouseleave", restart);
  show(0); restart();
}

/* ---------- 4. SCROLL ANIMATIONS (IntersectionObserver) ---------- */
function initReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach(i => i.classList.add("visible")); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  items.forEach(i => io.observe(i));
}

/* Animated number counters (scroll-triggered) */
function initCounters() {
  const nums = $$("[data-count]");
  if (!nums.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, suffix = el.dataset.suffix || "";
      const start = performance.now(), dur = 1600;
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick); obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
}

/* ---------- 5. FORM VALIDATION ---------- */
const RULES = {
  required: v => v.trim() !== "",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  phone: v => /^[+()\d][\d\s\-()]{6,17}$/.test(v.trim()),
  minLen: (v, n) => v.trim().length >= n,
  futureDate: v => { if (!v) return false; const d = new Date(v + "T00:00:00"), t = new Date(); t.setHours(0,0,0,0); return d >= t; }
};

function validateField(input) {
  const wrap = input.closest(".field");
  const msg = $(".error-msg", wrap);
  let error = "";
  const v = input.value;
  const label = input.dataset.label || "This field";

  if (input.required && !RULES.required(v)) error = `${label} is required.`;
  else if (input.type === "email" && v && !RULES.email(v)) error = "Please enter a valid email address.";
  else if (input.type === "tel" && v && !RULES.phone(v)) error = "Please enter a valid phone number (digits, spaces, + or -).";
  else if (input.dataset.minlen && v && !RULES.minLen(v, +input.dataset.minlen)) error = `${label} must be at least ${input.dataset.minlen} characters.`;
  else if (input.type === "date" && input.required && v && !RULES.futureDate(v)) error = "Please choose today's date or a future date.";
  else if (input.type === "number" && v !== "") {
    const n = +v;
    if (isNaN(n) || n < +input.min || n > +input.max) error = `${label} must be between ${input.min} and ${input.max}.`;
  }

  wrap.classList.toggle("invalid", !!error);
  input.setAttribute("aria-invalid", !!error);
  if (msg) msg.textContent = error;
  return !error;
}

/* ---------- 6. SENDING EMAILS (contact + appointment forms) ---------- */
function initForms() {
  $$("form[data-email-form]").forEach(form => {
    const fields = $$("input, select, textarea", form).filter(f => !f.classList.contains("honeypot-input") && f.name !== "botcheck");
    fields.forEach(f => {
      f.addEventListener("blur", () => validateField(f));
      f.addEventListener("input", () => { if (f.closest(".field").classList.contains("invalid")) validateField(f); });
    });

    const dateInput = $('input[type="date"]', form);
    if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const status = $(".form-status", form);
      const ok = fields.map(validateField).every(Boolean);
      if (!ok) {
        status.className = "form-status error show";
        status.textContent = "Please fix the highlighted fields and try again.";
        const firstBad = $(".field.invalid input, .field.invalid textarea, .field.invalid select", form);
        if (firstBad) firstBad.focus();
        return;
      }
      const btn = $("button[type=submit]", form), original = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending...";
      status.className = "form-status"; status.textContent = "";

      const data = new FormData(form);
      data.append("access_key", WEB3FORMS_ACCESS_KEY);
      data.append("subject", form.dataset.subject || "New enquiry from WanderLux website");
      data.append("from_name", "WanderLux Website");

      try {
        if (WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") throw new Error("NO_KEY");
        const res = await fetch(WEB3FORMS_URL, { method: "POST", body: data });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "Request failed");
        status.className = "form-status success show";
        status.textContent = form.dataset.success || "Thank you! Your message has been sent. We'll reply within one business day.";
        form.reset();
      } catch (err) {
        status.className = "form-status error show";
        status.textContent = err.message === "NO_KEY"
          ? "Setup needed: add your free Web3Forms access key in js/main.js to enable email sending."
          : "Sorry, we couldn't send your message. Please try again or email us directly at hello@wanderlux.example.";
      } finally {
        btn.disabled = false; btn.textContent = original;
      }
    });
  });
}

/* ---------- 7. TRIP COST CALCULATOR ----------
   Total = (daily cost x travellers x days  +  hotel rooms x nights x hotel rate)
           x travel-style multiplier
   Rooms = ceil(travellers / 2)  (twin-share). Nights = days - 1 (min 1). */
function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }

function initCalculator() {
  const form = $("#calc-form");
  if (!form) return;

  const dest = $("#destination"), trav = $("#travellers"), days = $("#days"), daysOut = $("#days-out");
  const result = $("#result"), preview = $("#dest-preview"), previewImg = $("img", preview);
  const budgetSel = $("#budget-note");

  /* Populate destination list from the rates table */
  Object.keys(DESTINATIONS).forEach(name => {
    const o = document.createElement("option"); o.value = name; o.textContent = name; dest.appendChild(o);
  });

  days.addEventListener("input", () => { daysOut.textContent = days.value; });
  dest.addEventListener("change", () => {
    const d = DESTINATIONS[dest.value];
    if (d) { previewImg.style.visibility = "visible"; previewImg.src = d.img; previewImg.alt = `Scenic view of ${dest.value}`; preview.hidden = false; }
    else preview.hidden = true;
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const fields = [dest, trav];
    if (!fields.map(validateField).every(Boolean)) return;

    const style = $('input[name="style"]:checked', form).value;
    const t = parseInt(trav.value, 10), n = parseInt(days.value, 10);
    const d = DESTINATIONS[dest.value], mult = STYLE_MULTIPLIER[style];

    const nights = Math.max(n - 1, 1);
    const rooms = Math.ceil(t / 2);
    const dailyCost = d.daily * t * n;
    const hotelCost = d.hotel * rooms * nights;
    const base = dailyCost + hotelCost;
    const total = base * mult;
    const perPerson = total / t;

    result.innerHTML = `
      <h3>Your Estimate</h3>
      <div class="result-total" aria-live="polite">${money(total)}</div>
      <p class="result-note"><strong>Estimated cost for ${t} traveller${t > 1 ? "s" : ""} to ${dest.value} for ${n} day${n > 1 ? "s" : ""}: ${money(total)} – ${PACKAGE_NAME[style]}.</strong></p>
      <table class="breakdown" aria-label="Cost breakdown">
        <tr><td>Daily costs (${money(d.daily)} × ${t} × ${n} days)</td><td>${money(dailyCost)}</td></tr>
        <tr><td>Accommodation (${rooms} room${rooms > 1 ? "s" : ""} × ${nights} night${nights > 1 ? "s" : ""} × ${money(d.hotel)})</td><td>${money(hotelCost)}</td></tr>
        <tr><td>Subtotal</td><td>${money(base)}</td></tr>
        <tr><td>${style} style multiplier</td><td>× ${mult}</td></tr>
        <tr><td>Approx. per person</td><td>${money(perPerson)}</td></tr>
      </table>
      <a class="btn" href="appointment.html">Book a Consultation</a>
      <p class="disclaimer">Estimates are indicative only and exclude international flights, visas and travel insurance. A consultant will confirm a final quote.</p>`;
    result.classList.add("visible");
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      daysOut.textContent = days.value; preview.hidden = true;
      result.innerHTML = `<div class="result-placeholder"><p>Choose your destination, group size, trip length and style, then press <strong>Calculate</strong> to see your estimate.</p></div>`;
      $$(".field", form).forEach(f => f.classList.remove("invalid"));
    }, 0);
  });
}
