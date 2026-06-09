import { z } from "zod";

const typeSchema = z.enum(["JOIN_CHAT", "CHAT_MESSAGE", "TYPING", "STOP_TYPING", "DELETE_MESSAGE"]);

const payloadSchema = z.object({
  name: z.string().optional(),
  text: z.string().optional(),
  to: z.string().optional(),
  replyTo: z.object({
    id: z.string(),
    name: z.string(),
    text: z.string(),
  }).optional(),
  id: z.string().optional(),
});

export const messageSchema = z.object({
  type: typeSchema,
  payload: payloadSchema.optional(),
});

export type MessageParsed = z.infer<typeof messageSchema>;
export type MessagePayload = z.infer<typeof payloadSchema>;


