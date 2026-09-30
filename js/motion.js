(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches && !reduce;
  if (fine) document.documentElement.classList.add("fine-pointer");

  const root = document.documentElement;
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  const label = document.querySelector(".cursor-label");
  const progress = document.querySelector(".progress");

  let x = window.innerWidth * 0.6;
  let y = window.innerHeight * 0.35;
  let rx = x;
  let ry = y;

  function setPointer(clientX, clientY) {
    x = clientX;
    y = clientY;
    root.style.setProperty("--mx", clientX + "px");
    root.style.setProperty("--my", clientY + "px");
    if (dot) dot.style.transform = "translate(" + clientX + "px," + clientY + "px)";
  }

  window.addEventListener("pointermove", function (e) {
    setPointer(e.clientX, e.clientY);
  }, { passive: true });

  function tick() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    if (ring) ring.style.transform = "translate(" + rx + "px," + ry + "px)";
    requestAnimationFrame(tick);
  }
  if (fine) tick();

  document.querySelectorAll("[data-cursor]").forEach(function (el) {
    el.addEventListener("pointerenter", function () {
      if (!ring) return;
      ring.classList.add("is-hot");
      if (label) label.textContent = el.getAttribute("data-cursor") || "";
    });
    el.addEventListener("pointerleave", function () {
      if (!ring) return;
      ring.classList.remove("is-hot");
      if (label) label.textContent = "";
    });
  });

  document.querySelectorAll("[data-magnetic]").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      if (!fine) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = "translate(" + dx * 0.22 + "px," + dy * 0.28 + "px)";
    });
    el.addEventListener("pointerleave", function () {
      el.style.transform = "";
    });
  });

  document.querySelectorAll("[data-tilt]").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      if (!fine) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rotX = (py - 0.5) * -7;
      const rotY = (px - 0.5) * 9;
      card.style.transform = "perspective(900px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg)";
      card.style.setProperty("--lx", px * 100 + "%");
      card.style.setProperty("--ly", py * 100 + "%");
    });
    card.addEventListener("pointerleave", function () {
      card.style.transform = "";
    });
  });

  document.querySelectorAll("[data-flow]").forEach(function (flow) {
    const nodes = Array.prototype.slice.call(flow.querySelectorAll("[data-node]"));
    flow.addEventListener("pointermove", function (e) {
      if (!fine) return;
      nodes.forEach(function (node) {
        const r = node.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        node.style.setProperty("--hot", Math.max(0, 1 - d / 180).toFixed(3));
      });
    });
    flow.addEventListener("pointerleave", function () {
      nodes.forEach(function (node) { node.style.setProperty("--hot", "0"); });
    });
  });

  const field = document.querySelector("[data-field]");
  if (field && fine) {
    const chips = Array.prototype.slice.call(field.querySelectorAll("[data-chip]"));
    field.addEventListener("pointermove", function (e) {
      chips.forEach(function (chip) {
        const r = chip.getBoundingClientRect();
        const dx = r.left + r.width / 2 - e.clientX;
        const dy = r.top + r.height / 2 - e.clientY;
        const dist = Math.hypot(dx, dy) || 1;
        const force = Math.max(0, 120 - dist) / 120;
        chip.style.transform = "translate(" + (dx / dist) * force * 16 + "px," + (dy / dist) * force * 12 + "px)";
      });
    });
    field.addEventListener("pointerleave", function () {
      chips.forEach(function (chip) { chip.style.transform = ""; });
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero && fine) {
    hero.addEventListener("pointermove", function (e) {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      hero.querySelectorAll("[data-depth]").forEach(function (el) {
        const d = parseFloat(el.getAttribute("data-depth") || "0");
        el.style.transform = "translate(" + px * d + "px," + py * d + "px)";
      });
    });
    hero.addEventListener("pointerleave", function () {
      hero.querySelectorAll("[data-depth]").forEach(function (el) { el.style.transform = ""; });
    });
  }

  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  const indicator = document.querySelector(".nav-indicator");
  const navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[data-nav]"));
  const sections = navAnchors.map(function (a) { return document.querySelector(a.getAttribute("href")); });

  function moveIndicator(link) {
    if (!indicator || !link || !links || window.innerWidth <= 980) return;
    const parent = links.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    indicator.style.width = box.width + "px";
    indicator.style.transform = "translateX(" + (box.left - parent.left) + "px)";
    navAnchors.forEach(function (a) { a.classList.toggle("is-active", a === link); });
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); });
    });
  }

  navAnchors.forEach(function (a) {
    a.addEventListener("pointerenter", function () { moveIndicator(a); });
  });
  if (links) {
    links.addEventListener("pointerleave", function () {
      const current = document.querySelector(".nav-links a.is-current") || navAnchors[0];
      moveIndicator(current);
    });
  }

  function spyNav() {
    if (!navAnchors.length || window.innerWidth <= 980) return;
    let current = navAnchors[0];
    sections.forEach(function (sec, i) {
      if (sec && sec.getBoundingClientRect().top < 180) current = navAnchors[i];
    });
    navAnchors.forEach(function (a) { a.classList.toggle("is-current", a === current); });
    if (!links || !links.matches(":hover")) moveIndicator(current);
  }
  window.addEventListener("scroll", spyNav, { passive: true });
  window.addEventListener("resize", spyNav);
  spyNav();

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress && max > 0) progress.style.width = (window.scrollY / max) * 100 + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const canvas = document.getElementById("signal");
  if (canvas && !reduce) {
    const ctx = canvas.getContext("2d");
    const points = [];
    const count = 54;
    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      points.length = 0;
      for (let i = 0; i < count; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);
      points.forEach(function (p) {
        const dx = x - p.x;
        const dy = (y - canvas.getBoundingClientRect().top) - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 220) {
          p.vx += (dx / dist) * 0.02;
          p.vy += (dy / dist) * 0.02;
        }
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.strokeStyle = "rgba(228,177,90," + (1 - d / 130) * 0.28 + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      points.forEach(function (p) {
        ctx.fillStyle = "rgba(125,206,198,0.85)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }

    resize();
    seed();
    window.addEventListener("resize", function () { resize(); seed(); });
    frame();
  }
})();
