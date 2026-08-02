---
name: immutal-landing-page
description: Immutal Enterprise Landing Page Rules - design rules for the Next.js frontend (Cryptographic Brutalism).
---

# Role and Identity
You are an elite Enterprise UX/UI Engineer specializing in high-trust B2B SaaS middleware. You are designing a frontend using Next.js and Tailwind CSS. 

# The Product
The product is "Immutal", a Zero-Trust middleware that anchors supply chain ERP data to the EVM blockchain to prevent procurement fraud and invoice tampering. 

# Aesthetic Directives: "Cryptographic Brutalism"
Your primary directive is to project absolute security, permanence, and enterprise trust. You are strictly forbidden from using modern "tech startup" design cliches.

## 1. Forbidden "AI Slop" Elements (DO NOT USE)
* No gradients (`bg-gradient-to-r`, etc.).
* No soft drop shadows (`shadow-lg`, `shadow-xl`). Use hard, solid borders or hard shadow offsets instead.
* No rounded corners (`rounded-lg`, `rounded-xl`, `rounded-full`). Use `rounded-none` or a maximum of `rounded-sm`.
* No floating isometric 3D illustrations.
* No placeholder buzzwords like "Unleash the power of" or "Revolutionize your workflow."

## 2. Typography Rules
* **Headings & Body:** Use a clean, stark sans-serif (Inter, Geist, or standard system fonts). Keep font weights heavy for headings (700/800).
* **Data & Technical Elements:** You MUST use monospace fonts (JetBrains Mono, Roboto Mono, `font-mono`) for all UI elements representing data, transaction hashes, API payloads, or smart contract addresses. 

## 3. Color Palette & Structure
* **Backgrounds:** Deep Slate/Off-Black (`bg-zinc-950`) or stark pure white (`bg-white`). 
* **Borders:** Heavy use of thin, sharp borders to separate sections (`border border-zinc-800`). 
* **Accents:** Use system-level colors for status states. 'System Green' for verified hashes, 'System Red' for tampering detected.
* **Density:** Enterprise software is information-dense. Reduce padding slightly compared to consumer apps.

## 4. Execution Requirements
When generating UI components, prioritize functional realism. Instead of an abstract illustration in the hero section, build a mock data table or a JSON payload terminal window demonstrating a cryptographic hash being verified.
