import { db } from "./db.js";

// Jeu de donnees d'exemple en anglais pour OpsDesk.
const sampleTickets = [
  {
    subject: "Cannot log in to the dashboard",
    body: "I keep getting an 'invalid credentials' error even after resetting my password twice.",
    category: "acces",
    priority: 3,
    status: "open",
    created_at: "2026-05-12T09:14:00Z",
  },
  {
    subject: "Invoice amount looks wrong",
    body: "My April invoice charges me for 12 seats but we only have 8 active users.",
    category: "facturation",
    priority: 2,
    status: "open",
    created_at: "2026-05-12T11:02:00Z",
  },
  {
    subject: "Export to CSV crashes the app",
    body: "Clicking 'Export' on the tickets page reloads the browser and loses my filters.",
    category: "bug",
    priority: 3,
    status: "open",
    created_at: "2026-05-13T08:45:00Z",
  },
  {
    subject: "Please add a dark mode",
    body: "Would love a dark theme for the agent console, my eyes hurt during night shifts.",
    category: "demande",
    priority: 1,
    status: "open",
    created_at: "2026-05-13T14:20:00Z",
  },
  {
    subject: "Two-factor codes never arrive",
    body: "The SMS with the 2FA code does not arrive, so I am locked out of my account.",
    category: "acces",
    priority: 3,
    status: "in_progress",
    created_at: "2026-05-14T07:33:00Z",
  },
  {
    subject: "Double charge on my credit card",
    body: "I was billed twice for the May subscription on the same day.",
    category: "facturation",
    priority: 3,
    status: "open",
    created_at: "2026-05-14T10:10:00Z",
  },
  {
    subject: "Notifications are duplicated",
    body: "Every email alert is sent three times for a single ticket update.",
    category: "bug",
    priority: 2,
    status: "open",
    created_at: "2026-05-15T16:05:00Z",
  },
  {
    subject: "Question about data retention policy",
    body: "How long do you keep closed tickets before they are deleted?",
    category: "autre",
    priority: 1,
    status: "open",
    created_at: "2026-05-16T09:00:00Z",
  },
  {
    subject: "API returns 500 on bulk update",
    body: "Calling the bulk status endpoint with more than 50 ids returns a server error.",
    category: "bug",
    priority: 3,
    status: "in_progress",
    created_at: "2026-05-16T13:47:00Z",
  },
  {
    subject: "Need an additional admin seat",
    body: "We are onboarding a new team lead and need to grant her admin access.",
    category: "demande",
    priority: 2,
    status: "open",
    created_at: "2026-05-17T08:22:00Z",
  },
  {
    subject: "Refund request for unused period",
    body: "We downgraded mid-month and would like a prorated refund for the unused seats.",
    category: "facturation",
    priority: 2,
    status: "open",
    created_at: "2026-05-17T15:30:00Z",
  },
  {
    subject: "Where can I find the changelog?",
    body: "I cannot locate the product changelog in the help center, can you share a link?",
    category: "autre",
    priority: 1,
    status: "closed",
    created_at: "2026-05-18T10:48:00Z",
  },
];

const insert = db.prepare(`
  INSERT INTO tickets (id, subject, body, category, priority, status, created_at)
  VALUES (@id, @subject, @body, @category, @priority, @status, @created_at)
`);

// Identifiants explicites stables (1001..1012) pour que les labs J3/J4 soient rejouables.
const seedAll = db.transaction((tickets: typeof sampleTickets) => {
  db.prepare("DELETE FROM tickets").run();
  tickets.forEach((ticket, index) => {
    insert.run({ id: 1001 + index, ...ticket });
  });
});

seedAll(sampleTickets);

console.log(`Seeded ${sampleTickets.length} tickets.`);
