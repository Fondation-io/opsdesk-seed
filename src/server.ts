import Fastify from "fastify";
import { PORT } from "./config.js";
import { getTicket, listTickets, updateTicketStatus } from "./tickets.js";

const app = Fastify({ logger: true });

// Sonde de sante (utilisee comme critere de verification d'environnement).
app.get("/health", async () => {
  return { status: "ok" };
});

// Liste tous les tickets.
app.get("/tickets", async () => {
  return listTickets();
});

// Retourne un ticket par identifiant.
app.get<{ Params: { id: string } }>("/tickets/:id", async (request, reply) => {
  const id = Number(request.params.id);
  const ticket = getTicket(id);
  if (!ticket) {
    return reply.code(404).send({ error: "ticket not found" });
  }
  return ticket;
});

// Met a jour le statut d'un ticket.
app.post<{ Params: { id: string }; Body: { status?: string } }>(
  "/tickets/:id/status",
  async (request, reply) => {
    const id = Number(request.params.id);
    const status = request.body?.status;
    if (!status) {
      return reply.code(400).send({ error: "status is required" });
    }
    const updated = updateTicketStatus(id, status);
    if (!updated) {
      return reply.code(404).send({ error: "ticket not found" });
    }
    return getTicket(id);
  },
);

app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then((address) => {
    app.log.info(`OpsDesk listening on ${address}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
