import type { Post } from "@/lib/api/types";

const seededAt = "2026-11-10T09:30:00Z";

export function seedPosts(): Post[] {
  return [
    {
      id: "7f1c9d4e-2a3b-4c5d-8e9f-000000000001",
      title: "A calmer way to review a release",
      content:
        "We changed the order of our release review: first the user-visible outcome, then the risks, and only then the implementation details.\n\nThe conversation became shorter and more useful. Reviewers stopped reconstructing intent from a diff, and authors stopped defending code that had not been questioned.",
      authorSubject: "editor",
      authorName: "Ellis Editor",
      createdAt: "2026-11-04T08:15:00Z",
      updatedAt: "2026-11-10T09:30:00Z",
      version: 3,
    },
    {
      id: "7f1c9d4e-2a3b-4c5d-8e9f-000000000002",
      title: "Why we write decisions down",
      content:
        "A decision that lives only in a chat thread disappears when the thread scrolls away. A short record with the context, the choice, and the trade-off costs ten minutes and saves hours.\n\nWe keep the record close to the work, not in a separate archive that nobody opens.",
      authorSubject: "editor",
      authorName: "Ellis Editor",
      createdAt: "2026-11-02T11:00:00Z",
      updatedAt: "2026-11-08T14:20:00Z",
      version: 1,
    },
    {
      id: "7f1c9d4e-2a3b-4c5d-8e9f-000000000003",
      title: "The quiet cost of unclear names",
      content:
        "Names are the cheapest documentation we have. When a name describes the wrong thing, every new reader pays for it.\n\nRenaming is not cosmetic. It is a small, repeated act of making the system easier to reason about.",
      authorSubject: "admin",
      authorName: "Alex Administrator",
      createdAt: "2026-10-28T07:45:00Z",
      updatedAt: "2026-11-05T16:05:00Z",
      version: 0,
    },
    {
      id: "7f1c9d4e-2a3b-4c5d-8e9f-000000000004",
      title: "Notes from a week of pairing",
      content:
        "Pairing worked best when we agreed on the next small step and then took turns driving.\n\nThe unexpected benefit was vocabulary. Two people left the week using the same words for the same concepts, which made the following week noticeably easier.",
      authorSubject: "editor",
      authorName: "Ellis Editor",
      createdAt: seededAt,
      updatedAt: "2026-11-09T10:10:00Z",
      version: 2,
    },
  ];
}
