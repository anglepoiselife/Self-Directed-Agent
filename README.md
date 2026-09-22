# Self-Directed-Agent
Fully Autonomous agent capable of running 24hrs plus, building complete complex applications (e.g. Postgres-SpringBoot-React) unattended using an RTX5090 and Qwen 3.8 26B

Genesis Anchor:  0cdfe09fa3dca3e289184b32aaed265a392a450c0ac2df871ae99b64230fe730


REFER to INTRODUCTION.md it is more complete
===========================================================================

Harness runs Qwen 3.8 27B for 24hr on an RTX5090, installs software and writes a Postgres-SpringBoot-React spreadsheet application fully unattended

There is a lot to be said for a smart harness. The challenge I set myself was to be able to fully autonomously create real working complex applications using a small LLM (no frontier model access at all). It had to fit in 32GB VRAM (RTX5090) with a limited 32k context window. The only use of the Internet by the LLM itself was to install software onto a bare ubuntu VM image - no other help.

All I gave it was 10 initial goals and a brief description of the application. It churned for around 24hours, installing software, writing code, testing, debugging, re-writing and finally completed its end to end tests (I have the full log). I opened my browser and pointed it at http://192.168.1.12:7060/ where Spring boot was running and I had a spreadsheet application with security, workbooks, sheets, data entry and formulae.

I have looked at papers such as: https://arxiv.org/pdf/2604.06742

They talk about findings like the CLI-Tool-Bench paper—highlighting that unconstrained frontier models on OpenHands/Mini-SWE-Agent hit failure ceilings and thrashing loops on simple CLI tasks. The application that my harness built appears to be far more complex. - it had to create full database schema for example.

The Harness I built was originally just for fun - agents talking to each other trying to survive and strive - driven by primal goals. It progressed to research on the internet and publishing full reports or writing books. Then I thought I would give it a try at building code. What really unlocked this was the Qwen 3.8 26B model - yes it is slow when reasoning, but hugely capable. But to build an application in 24 hours and test it on a <$4000 machine using <$10 of electricity seems fairly useful. There were over 50 source files created for the backend and front end all working together - I could see it was struggling from time to time, but eventually resolved the issues and completed the full operational application.

I intend to share some of the snippets from its logs and screen shots if people are interested - just ask and I can upload them somewhere.

Description provided for the first test application:

"To build an appealing modern looking SaaS service that provides end users with spreadsheets in a workspace called Sheets. Functionality will cover: root page: workbook CRUD (a list of only their own workbooks - click to open a workbook, a create button and delete button). If the user is not logged in they will be asked to log in or create an account and password. When a workbook is selected the spreadsheet is opened, first default sheet in a new workbook is 'Sheet1'. If not an existing workbook, it should be a blank grid A to Z and 1 to 32, if it is a previously created workbook then the first sheet is opened with data populated. The spreadsheet cells should look and behave like classic spreadsheet cells, text, numbers or formulae can be entered, the sheet auto-updates and auto-saves when a user enters something and hits return. The title bar has the workbook name and any relevant buttons, the bottom of the screen has a bar of sheet tabs, with the ability to add and delete sheets."

THE HARNESS:

So the harness I built myself - no third party components other than the standard software open source. It is a SpringBoot application itself with a browser front end for setting up agents and monitoring them. Key capabilities:

- Goal hierarchy
- Context compression
- Memory and facts
- File manipulation, search and editing tools
- Linux VM command line access
- A browser automation tool

The following capabilities exist but were not used in these scenarios:
- Web search and web access tools
- Diagram and image generation request and management
- Task scheduling
- Email capability
- Communication between agents
- Movement between virtual locations

PS this is just a hobby, trying to keep my aging brain sharp...
