-- Sample content so the application is useful on first start.
-- Fixed identifiers keep repeated local resets deterministic.
INSERT INTO posts (id, title, content, author_subject, author_name, created_at, updated_at, version)
VALUES
  (
    '7f1c9d4e-2a3b-4c5d-8e9f-000000000001',
    'A calmer way to review a release',
    'We changed the order of our release review: first the user-visible outcome, then the risks, and only then the implementation details.

The conversation became shorter and more useful. Reviewers stopped reconstructing intent from a diff, and authors stopped defending code that had not been questioned.',
    'editor',
    'Ellis Editor',
    '2026-11-04T08:15:00Z',
    '2026-11-10T09:30:00Z',
    3
  ),
  (
    '7f1c9d4e-2a3b-4c5d-8e9f-000000000002',
    'Why we write decisions down',
    'A decision that lives only in a chat thread disappears when the thread scrolls away. A short record with the context, the choice, and the trade-off costs ten minutes and saves hours.

We keep the record close to the work, not in a separate archive that nobody opens.',
    'editor',
    'Ellis Editor',
    '2026-11-02T11:00:00Z',
    '2026-11-08T14:20:00Z',
    1
  ),
  (
    '7f1c9d4e-2a3b-4c5d-8e9f-000000000003',
    'The quiet cost of unclear names',
    'Names are the cheapest documentation we have. When a name describes the wrong thing, every new reader pays for it.

Renaming is not cosmetic. It is a small, repeated act of making the system easier to reason about.',
    'admin',
    'Alex Administrator',
    '2026-10-28T07:45:00Z',
    '2026-11-05T16:05:00Z',
    0
  ),
  (
    '7f1c9d4e-2a3b-4c5d-8e9f-000000000004',
    'Notes from a week of pairing',
    'Pairing worked best when we agreed on the next small step and then took turns driving.

The unexpected benefit was vocabulary. Two people left the week using the same words for the same concepts, which made the following week noticeably easier.',
    'editor',
    'Ellis Editor',
    '2026-10-30T09:30:00Z',
    '2026-11-09T10:10:00Z',
    2
  )
ON CONFLICT (id) DO NOTHING;
