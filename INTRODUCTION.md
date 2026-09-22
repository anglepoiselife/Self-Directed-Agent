# Autonomous 24-Hour Full-Stack Build: Running Qwen 3.8 27B Unattended on a Single RTX 5090

> **TL;DR:** I built a custom, deterministic orchestration harness that ran Qwen 3.8 27B on a single local RTX 5090 (32GB VRAM) for 24 hours unattended within a strict 32k context window. Starting with a blank Ubuntu VM and a high-level spec, it installed prerequisites, created the database schema, wrote over 50 source files for a full-stack PostgreSQL + Spring Boot + React/Vite spreadsheet SaaS (with authentication and formula evaluation), debugged build failures, and verified the UI through automated browser testing. Total cost: <$10 in electricity.

---

## 1. The Challenge and Constraints

There is a lot to be said for a smart harness. The challenge I set myself was to achieve fully autonomous, zero-human-input software engineering using an open-weight local model—without relying on frontier APIs (Claude, OpenAI, etc.).

The system was held to strict hardware and context boundaries:
* **Hardware:** Single NVIDIA RTX 5090 (32GB VRAM), full system build <$4,000.
* **Model:** Qwen 3.8 27B (local inference).
* **Context Boundary:** Hard limit of 32k tokens (split evenly into ~15k prompt / ~15k generation).
* **Network Isolation:** Zero internet access or external LLM calls during execution, with the sole exception of standard package manager installations (`apt`, `npm`, etc.) on a bare Ubuntu VM.

---

## 2. The Outcome

From only 10 initial high-level goals and a brief natural-language specification, the harness ran continuously for approximately 24 hours. 

During this run, the system:
1. Provisioned dependencies and configured system environments on a blank Ubuntu VM.
2. Initialized and configured PostgreSQL.
3. Designed and compiled a Java / Spring Boot backend exposing REST endpoints and WebSocket channels.
4. Scaffolded and built a React / Vite frontend compiled into static assets served directly by Spring Boot.
5. Implemented full user registration, JWT authentication, workbook CRUD, sheet management, and reactive formula calculation.
6. Iteratively caught compiler and runtime errors, debugged issues, and passed automated end-to-end tests.

After the run completed, I pointed a browser at the local port (`http://<local-ip>:7060/`) and had a fully functional spreadsheet application running with live security, data persistence, and formula updating. Over 50 source files were generated and integrated across the frontend and backend.

---

## 3. Comparison to Recent Benchmarks

Recent academic literature highlights the limitations of standard agent loops on 0-to-1 repository creation. For example, the **CLI-Tool-Bench** paper ([arXiv:2604.06742](https://arxiv.org/abs/2604.06742)) evaluated state-of-the-art frontier models (GPT-5.4, Claude Sonnet 4.6, Kimi-k2.5) across frameworks like OpenHands and Mini-SWE-Agent[cite: 1]. 

Key takeaways from that research include[cite: 1]:
* The best frontier models maxed out at an overall success rate of ~43.8% on CLI tools, with steep degradation on compiled languages[cite: 1].
* Agents frequently enter unproductive debugging spirals ("thrashing") when given unconstrained terminal access, burning millions of tokens without making forward progress[cite: 1].
* Unconstrained models universally prefer monolithic, single-file scripts (1–3 files) to avoid cross-file dependency and context management failures[cite: 1].

Building a multi-tier enterprise stack (PostgreSQL + Spring Boot + React) is inherently multi-file, strictly typed, and state-heavy. An unconstrained free-agent loop will almost certainly derail or hallucinate. This experiment demonstrates that with the right harness architecture and strict memory management, even a 27B local model can navigate multi-file modularity and long-horizon tasks that frequently derail frontier models in open loops.

---

## 4. The Application Specification

Below is the initial prompt provided to the harness:

```text
To build an appealing modern looking SaaS service that provides end users with spreadsheets
in a workspace called Sheets. 

Functionality will cover:
- Root page: workbook CRUD (a list of only their own workbooks - click to open a workbook, 
  a create button and delete button). 
- Authentication: If the user is not logged in, prompt to log in or create an account/password.
- Workbook view: When selected, the spreadsheet opens. The first default sheet in a new workbook
  is 'Sheet1'. If a new workbook, render a blank grid A to Z and 1 to 32; if an existing workbook,
  populate persisted data.
- Cell engine: Cells should look and behave like classic spreadsheet cells. Text, numbers, or 
  formulae can be entered; the sheet auto-updates and auto-saves on Enter.
- UI: Title bar displays workbook name and action buttons; bottom navigation bar includes sheet 
  tabs with the ability to add, switch, and delete sheets.
 ```
 
---

 ## 5. The Harness Architecture

The harness is custom-built with no external agent orchestration frameworks. It runs as a Spring Boot application with a dedicated web interface for telemetry, agent lifecycle control, and real-time monitoring.

### Core Mechanisms Used in this Run:
* **Deterministic Goal Hierarchy:** Replaces open-ended wandering with bounded, progressive execution stages.
* **Context Compression & Eviction:** Strictly caps prompt size at ~15k tokens, aggressively evicting historical build traces while preserving functional interface contracts.
* **Structured Fact/Memory Store:** Maintains project state, schema contracts, and environment variables out-of-band rather than polluting the active KV cache.
* **File Operations & Diff Tools:** Controlled AST and line-targeted file editing rather than full-file rewrites.
* **Direct VM Shell Access:** Isolated execution sandbox for shell commands, package installations, and compiler outputs.
* **Automated Browser Tool:** Headless browser validation to test real DOM state and verify UI assertions end-to-end.

*(Note: The harness also features web browsing, agent-to-agent communication, and scheduling tools, but these were explicitly disabled for this offline build).*

---

## 6. Verification and Discussion

Running local inference for 23 hours 10 minutes on an RTX 5090 consumed roughly 18–20 kWh of power, working out to under **$10 / £5** of domestic electricity.

The logs showed that around 5000 calls were made to my local LLM, typical average prompt size was ~10000 tokens  - so approximately 49m prompt tokens were required.
LLM token generation figures are less accurate, vllm logs suggest the output is around 40 tokens per second, suggesting a generated 3.3m tokens in the 23hrs 10minutes of running.

---

## 7. Code Upload

The four folders (backend, frontend, testcase, Docs) and their contents were all created by the LLM and harness. Apologies, the 32k context limit meant that the LLM 
has kept files short - hence no documentation in the files. This represents a fully running workbook and spreadsheet App. The spec was brief, the LLM created the
test cases and API spec.


I am preparing sanitized extracts of the execution logs, screenshots of the resulting application - watch this space.

---
*PS: This is an independent hobby project focused on testing the boundaries of local hardware and long-horizon agent architectures.*
 
