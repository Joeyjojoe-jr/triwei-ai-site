import { defineCollection, z } from 'astro:content';
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tags: z.array(z.string()).optional(),
    description: z.string().optional()
  })
});
export const collections = { posts };