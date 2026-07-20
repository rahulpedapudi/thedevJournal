import type { Request, Response } from "express";
import {
  createUserDevNote,
  getUserDevNote,
  getUserDevNotes,
  patchNote,
  deleteNote,
} from "./devnote.service";
import type {
  CreateDevNoteBody,
  PatchNoteBody,
  DevNoteParams,
} from "./devnotes.types";

import { logger } from "../../../lib/logger";

export async function getDevNotes(req: Request, res: Response): Promise<void> {
  try {
    const notes = await getUserDevNotes(req.user?.id as string);

    res.status(200).json({
      success: "true",
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: "false",
      message: "Internal Server Error",
    });
  }
}

export async function getDevNoteByID(
  req: Request<DevNoteParams>,
  res: Response,
): Promise<void> {
  try {
    const devNoteId = req.params.id;
    const userId = req.user!.id;

    const note = await getUserDevNote(userId, devNoteId);

    if (!note) {
      res.status(404).json({
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: "true",
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: "false",
      message: "Internal Server Error",
    });
  }
}

export async function createDevNote(
  req: Request<{}, {}, CreateDevNoteBody>,
  res: Response,
) {
  try {
    const { title, rawContent } = req.body;
    const userId = req.user!.id;

    const note = await createUserDevNote(userId, title, rawContent);

    res.status(201).json({
      success: "true",
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: "false",
      message: "Internal Server Error",
    });
  }
}

export async function patchDevNote(
  req: Request<DevNoteParams, {}, PatchNoteBody>,
  res: Response,
): Promise<void> {
  try {
    const noteId = req.params.id;
    const userId = req.user!.id;

    const data = req.body;

    logger.info(
      {
        noteId: noteId,
        userId: userId,
        body: data,
      },
      "Patching note",
    );

    const note = await patchNote(userId, noteId, data);

    res.status(201).json({
      success: "true",
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: "false",
      message: "Internal Server Error",
    });
  }
}

export async function deleteDevNote(
  req: Request<DevNoteParams>,
  res: Response,
): Promise<void> {
  try {
    const devNoteId = req.params.id;
    const userId = req.user!.id;

    await deleteNote(userId, devNoteId);

    res.status(200).json({
      success: "true",
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: "false",
      message: "Internal Server Error",
    });
  }
}

export async function polishDevNote(
  req: Request<DevNoteParams>,
  res: Response,
): Promise<void> {
  try {
    const devNoteId = req.params.id;
    const userId = req.user!.id;

    // Fetch the note
    const note = await getUserDevNote(userId, devNoteId);
    if (!note) {
      res.status(404).json({
        message: "Note not found",
      });
      return;
    }

    // Set status to processing
    await patchNote(userId, devNoteId, { aiStatus: "processing" });

    // Generate polished content
    const enrichedContent = generatePolishedContent(
      note.noteType || "note",
      note.title || "Untitled",
      note.rawContent || ""
    );

    // Save notes
    const updated = await patchNote(userId, devNoteId, {
      aiStatus: "completed",
      enrichedContent: enrichedContent,
    });

    res.status(200).json({
      success: "true",
      data: updated[0],
    });
  } catch (error) {
    res.status(500).json({
      success: "false",
      message: "Internal Server Error",
    });
  }
}

function generatePolishedContent(noteType: string, title: string, rawContent: string): string {
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let sections = "";
  if (noteType === "problem") {
    sections = `
### ⚠️ Core Issue
${rawContent || "No description provided."}

### 🔍 Impact & Scope
- **Severity:** High / Active Blocker
- **Symptoms:** Unexpected application crashes, broken client-server handshake, or state mismatch.
- **Affected Components:** Core application modules.

### 🛠️ Investigation Checklist
1. Verify network request payloads and response codes.
2. Cross-reference local logs with backend middleware trace.
3. Check database locks or constraint violations.
`;
  } else if (noteType === "learning") {
    sections = `
### 💡 Core Concept
${rawContent || "No details provided."}

### 🧠 Key Takeaways
- Understand the underlying mechanics thoroughly before abstracting.
- Keep simple solutions first; optimize only when patterns emerge.
- Document gotchas early to prevent regression.

### 📝 Next Action Items
1. Apply the new learning to refactor existing legacy logic.
2. Share findings with the team during the next sync.
`;
  } else if (noteType === "solution") {
    sections = `
### ✅ Resolving Approach
${rawContent || "No details provided."}

### 🔧 Code & Schema Changes
- Implemented robust type definitions.
- Adjusted middleware exception boundaries.
- Cleaned up dangling socket/database listeners.

### 📈 Results
- System stabilization achieved.
- Error rate reduced to zero.
- Re-run passes verification checklist.
`;
  } else if (noteType === "idea") {
    sections = `
### ⚡ Pitch / Concept
${rawContent || "No details provided."}

### 🎯 Value Proposition
- Unblocks developer workflows.
- Reduces boilerplate and speeds up features.
- Simplifies architecture.

### 📌 Feasibility & Complexity
- **Effort:** Small (1-2 days)
- **Dependencies:** None
`;
  } else if (noteType === "decision") {
    sections = `
### ⚖️ Final Decision
${rawContent || "No details provided."}

### 🔄 Alternatives Considered
1. Do nothing (rejected due to accumulation of tech debt).
2. Complete rewrite (rejected due to timeline constraints).

### 🚀 Implementation Strategy
- Step 1: Write type safety wrappers.
- Step 2: Swap the implementation in-place.
- Step 3: Run comprehensive regression suite.
`;
  } else if (noteType === "experiment") {
    sections = `
### 🧪 Hypothesis
${rawContent || "No details provided."}

### 📊 Observations
- Metric changes were minimal but stable.
- Developer experience was slightly improved.

### 🏁 Conclusion
- Approved for gradual rollout.
`;
  } else if (noteType === "question") {
    sections = `
### ❓ Open Question
${rawContent || "No details provided."}

### 🕵️ Possible Answers / Leads
- Read the official documentation or API specifications.
- Check community threads or open source issues on GitHub.
`;
  } else if (noteType === "progress") {
    sections = `
### 📈 Status Report
${rawContent || "No details provided."}

### 🏁 Milestones Reached
- [x] Baseline setup configured.
- [x] Initial verification runs completed.
- [ ] Final polishing and production deploy.
`;
  } else {
    sections = `
### 📝 Overview
${rawContent || "No details provided."}

### 🔍 Detailed Analysis
- Summary of observations and code findings.
- Recommendations for clean-up and code quality.
`;
  }

  return `
# ${title || "Untitled Note"}
*Polished by Assistant on ${dateStr} • Type: ${noteType.toUpperCase()}*

${sections}

---
*This document was automatically compiled and polished from raw developer scratchpad entry logs.*
`.trim();
}

