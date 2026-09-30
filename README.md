# Onkar Dinkar Shinde — Portfolio

Public portfolio for a telecom OSS backend engineer at Amdocs in Pune. The page introduces the work behind product orders: TMF-622 orchestration, the TSF Mobile B2B fulfillment path, logistics and catalogue migrations, gateway cutovers, and test automation.

Open `index.html` in a browser. No build step and no server are required.

## Technology

| Piece | Choice |
| --- | --- |
| Markup | HTML |
| Presentation | CSS, no framework |
| Behavior | JavaScript, no framework |
| Type | Static site |
| Typefaces | Fraunces and Outfit, loaded from Google Fonts |
| Contact delivery | EmailJS in the browser. If that connection fails, the Netlify site stores the form. Mailto is the last fallback. |
| Resume | PDF in `assets/` |

The navbar, portrait, project cards, and skill chips respond to the pointer. `prefers-reduced-motion` turns that motion off.

## Layout

- `index.html` — the site
- `css/portfolio.css` — layout and visual system
- `js/motion.js` — pointer effects and the section highlight in the navbar
- `js/contact-form.js` — contact form
- `js/emailjs.config.example.js` — template for local EmailJS settings
- `resume.html`, `projects.html`, `contact.html` — short redirects into the one-page site
- `assets/` — portrait, office photo, favicon, and resume PDF

## Contact form

Copy `js/emailjs.config.example.js` to `js/emailjs.config.js` and add your EmailJS service id, template id, and public key. That file is gitignored. Without it, the form still offers a mailto fallback.

## What is not in this repository

Deploy scripts, server notes, and the EmailJS public key are kept off this public repository.
