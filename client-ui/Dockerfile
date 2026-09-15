# Dev image: Vite listens on CLIENT_UI_PORT from Compose/env.
FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Default for local docs; Compose overrides via environment.
ENV CLIENT_UI_PORT=5173

CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port ${CLIENT_UI_PORT}"]
