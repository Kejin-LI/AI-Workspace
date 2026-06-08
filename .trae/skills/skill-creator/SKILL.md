---
name: "skill-creator"
description: "MANDATORY tool for creating SKILLs. Invoke IMMEDIATELY when user wants to create/add/make a new skill, or asks how to create a skill."
---

# Skill Creator

This skill helps you create new SKILLs for the workspace. It adopts the **Agent Skills open standard**, treating skills as filesystem-based domain knowledge packages.

## When to Use

**CRITICAL: You MUST invoke this skill IMMEDIATELY as your FIRST action when:**
- User wants to create a new skill
- User wants to add a custom skill to the workspace
- User asks to set up a skill template
- User asks "how to create a skill"
- User mentions creating/adding/making any skill

## SKILL Structure (Agent Skills Standard)

Following the latest Agent Skills standard (like Claude's implementation), a skill is a self-contained directory with a core `SKILL.md` file. It relies on **Progressive Disclosure**: the YAML frontmatter is used for intent recognition, while the Markdown body provides the full SOP. It also clearly separates the SOP (Skill) from atomic tools (MCP).

When the user asks to create a skill, scaffold the following structure in `skills/<skill-name>/`:

1. **`SKILL.md` (The Core)**
   - **YAML Frontmatter (Metadata Layer)**: Must contain `name`, `description` (crucial for intent recognition), and optional `dependencies` or `metadata`. This is the lightweight context loaded first.
   - **Markdown Body (Instruction Layer)**: The System Prompt (SOP) defining the skill's persona, boundaries, workflow steps, and how to use specific tools (MCP).
2. **`references/` (Optional RAG/Context)**
   - Directory for supplemental knowledge base files (Markdown, PDFs, etc.). The `SKILL.md` can instruct the agent to read these only when specific conditions are met.
3. **`scripts/` or `tools/` (Optional Executables/MCP)**
   - Directory for local scripts (`.py`, `.js`, `.sh`) or MCP server definitions that the skill might need to invoke.

*Note for Trae IDE compatibility: Also create a symlink or a lightweight trigger file at `.trae/skills/<skill-name>/SKILL.md` if the user wants this skill to be natively triggerable in the current IDE.*

## Creation & Iteration Workflow (Human-in-the-Loop + Agent RL)

To create a high-quality skill, you must act as a proactive evaluator. Follow this Step-by-Step wizard approach:

1. **Requirement Gathering (HITL)**: 
   - **CRITICAL**: Use the `AskUserQuestion` tool to gather structured requirements (e.g., skill name, specific domain, need for MCP tools, need for RAG). Do not just guess. Provide multi-choice options where applicable to guide the user.
2. **Draft the Core Files**:
   - Create `skills/<skill-name>/SKILL.md` with the YAML Frontmatter (`name`, `description`) and Markdown Body (SOP).
   - Create `skills/<skill-name>/references/` and `skills/<skill-name>/scripts/` if required.
   - Link to `.trae/skills/<skill-name>/SKILL.md` for IDE compatibility.
3. **Generate Test Cases & Eval**:
   - Once the draft is created, **proactively generate 2-3 mock test cases** representing real-world user queries for this skill.
   - Simulate a run of these test cases using the new `SKILL.md` SOP.
   - Generate an Eval Review report (e.g., creating a local `skills/<skill-name>/eval_review.md` or outputting a structured comparison in chat) showing the difference between "Without Skill" and "With Skill".
4. **Iterative Refinement (RLHF)**:
   - Present the Eval results to the user.
   - Ask for feedback: "Does this output meet your expectations? What feels clunky or fails?"
   - Use their feedback to refine the `SKILL.md` (adding constraints, fixing edge cases, adjusting tool calls). Every iteration is a manual RLHF cycle.
