import { app } from "./src/app.js";
import { connectToDB } from "./src/config/database.js";
import { env } from "./src/config/env.js";

const PORT = env.PORT || 3000;

/**
 * Initializes database connection and starts Express HTTP server listening on configured PORT.
 * @returns {Promise<void>}
 */
async function startServer() {
  await connectToDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  });
}

startServer();

