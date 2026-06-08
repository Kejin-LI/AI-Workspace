---
name: "marketing"
description: "Handles marketing-related tasks such as copywriting, campaign planning, and market analysis. Invoke when user asks for marketing copy, SEO optimization, campaign strategy, or ad content creation."
---

# Marketing Skill

This skill is designed to handle professional marketing workflows. It leverages the complete engineering package located in `skills/marketing/`.

## When to Use
Invoke this skill immediately when the user requests:
- Writing or optimizing marketing copy (emails, landing pages, ads)
- Planning marketing campaigns
- Analyzing market trends or competitor data
- SEO content generation

## Underlying Architecture
This skill operates using the Agent Skills standard structure:
- **Core Skill**: Defines the persona, dependencies, and instructions as an expert marketer (located in `skills/marketing/SKILL.md`).
- **Execution Script**: Node.js script capable of calling external APIs for analytics or content generation (located in `skills/marketing/scripts/index.js`).
- **References Base**: Uses internal marketing guidelines and brand assets (located in `skills/marketing/references/`).
