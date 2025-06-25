import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono().basePath('/api');

app.get('/hello', (c) => {
    return c.json({ message: 'Hello, world!' });
});

app.get('/goodbye', (c) => {
    return c.json({ message: 'Goodbye, world!' });
});

export const GET = handle(app);