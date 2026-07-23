# TASK_RESOURCES_AGENT.md

# Task Resources (Attachments) – Product Specification

## Goal

Introduce **Resources** for every task.

Do **not** treat this as a simple attachment feature.

The architecture must allow this feature to evolve into one of the core AI capabilities of ClearSpace.

---

# Philosophy

Avoid naming the feature **Attachments**.

Use **Resources** instead.

Reason:

Today:
- Files
- Images

Future:
- PDFs
- Markdown
- Office documents
- URLs
- Figma links
- GitHub links
- Videos
- AI Context

The name "Resources" scales much better.

---

# MVP (v1)

Every task contains a Resources section.

Supported file types:

- PDF
- DOCX
- TXT
- MD
- PNG
- JPG
- WEBP
- CSV
- XLSX

Store:

- filename
- size
- mime type
- uploaded by
- uploaded at
- download URL

Storage:
- Supabase Storage

Metadata:
- PostgreSQL

Permissions:
- Same RLS as the parent project.

---

# UI

Task

- Description
- Comments
- Resources
  - PRD.pdf
  - Hero.png
  - Notes.md
  - Budget.xlsx
- Activity

Requirements:

- upload
- preview (where possible)
- download
- delete
- drag & drop upload

---

# Database

Table:

task_resources

Fields:

- id
- task_id
- storage_path
- filename
- mime_type
- size
- uploaded_by
- created_at

---

# Future Roadmap

## v2 – AI Context

AI reads uploaded resources and can:

- summarize
- extract requirements
- generate tasks
- answer questions using uploaded resources

## v3 – Smart Resources

Automatically classify uploaded content:

- design
- requirements
- meeting notes
- technical documentation
- spreadsheet

## v4 – Semantic Search

Search across:

- tasks
- comments
- resources
- PDFs
- markdown
- screenshots

---

# Architecture Principles

- Production-ready
- Reusable components
- Reusable hooks
- Strict TypeScript
- Minimal queries
- Optimistic UI
- Scalable architecture

Implement only MVP.

Prepare foundations for future AI features without implementing them.

---

# Deliverables

- implementation summary
- changed files
- database changes
- storage changes
- architecture decisions
- future recommendations
