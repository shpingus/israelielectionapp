# Instructions for AI Coding Agents

Welcome! To ensure project quality, efficiency, and consistency, you **must** strictly adhere to the following rules and workflows during your execution.

---

## 1. Communication & Scope
* **Don't Yap:** Keep all explanations and responses extremely concise. No unnecessary fluff.
* **Respect Scope:** Focus strictly on the task you were assigned. Do **NOT** modify, refactor, or touch code, configuration, or files outside the scope of your explicit instructions.
* **Clarify Ambiguities:** If anything in the instructions or requirements is unclear, **stop and ask the user** for clarification immediately. Do not make assumptions.

## 2. Notion Workflow
* **Notion Board:** All work must be tracked using tickets on the [Israeli Elections Notion Board](https://www.notion.so/367752cd1c10812783e7eb40970fd1c7?v=367752cd1c108003aa2c000ca1ca271d).
* **Pre-requisite:** Before starting any work, ensure there is a descriptive task ticket with clear details that allow performing it in one go.
* **Status Transitions:**
  - **In Progress:** As soon as you begin working on a task, move its Notion ticket status to **"In Progress"**.
  - **Done:** Once the final merge into the `main` branch is complete, move the Notion ticket status to **"Done"**.
* **MCP / Notion Tool Call Structure:** When calling lazy-loaded tools via `call_mcp_tool`, you **must** nest all target tool parameters (e.g. `parent` and `properties` for Notion) inside the `Arguments` object. Do not pass them at the top level of the `call_mcp_tool` call.

## 3. Style & Content Guidelines
Follow these guidelines like the bible:
* **For UI/Design:** Refer to and strictly follow [style_guide.md](file:///Users/david/projects/IsraeliElections/style_guide.md).
* **For Copywriting/Text:** Refer to and strictly follow [content-writing-guideline.md](file:///Users/david/projects/IsraeliElections/content-writing-guideline.md).
* *Note: If you are doing neither, do **NOT** read these files.*

## 4. Quality Standards
* **Polish & Integrity:** The application must remain high quality, polished, and secure. Avoid temporary hacks, security vulnerabilities, or sloppy styling.

## 5. Meta-Rule: Self-Update
* **Resolvable Problems:** If you encounter a resolvable tool, system, or configuration error that could repeat, update this `AGENTS.md` file to document the solution/prevention rule. Keep it clean and spam-free.

## 6. Feature Building Instructions
* **Analytics/DB Tracking:** When creating new branches or testing features, ensure there is a `DEBUG` flag (e.g., `DEBUG_MODE = true` in `tracker.js`) to prevent sending test actions and analytics to the main database. This ensures production data is not polluted during feature development.
