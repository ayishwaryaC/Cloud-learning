const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;
const APP_NAME = process.env.APP_NAME || "Docker App";
const MODE = process.env.APP_MODE || "development";
const BG = process.env.BG_COLOR || "#f2f2f2";
const TEXT = process.env.TEXT_COLOR || "#ffffff";
const MESSAGE = process.env.MESSAGE || "Welcome";

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${APP_NAME}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, ${BG}, #ffffff);
          color: ${TEXT};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        .card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 500px;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }

        h2 {
          margin-bottom: 20px;
          color: #000000;
        }

        p {
          font-size: 1.1rem;
          margin: 8px 0;
        }

        .badge {
          display: inline-block;
          margin-top: 15px;
          padding: 8px 15px;
          border-radius: 20px;
          background: #22c55e;
          color: #000;
          font-weight: bold;
        }

        footer {
          margin-top: 20px;
          font-size: 0.9rem;
          opacity: 0.7;
        }
      </style>
    </head>
    <body>

      <div class="card">
        <h1>🚀 ${APP_NAME}</h1>
        <h2>${MESSAGE}</h2>

        <p><strong>Mode:</strong> ${MODE}</p>
        <p><strong>Port:</strong> ${PORT}</p>
        
        <div class="badge">Docker ENV Active </div>

        <footer>
          Powered by Docker 🐳 + Node.js
        </footer>
      </div>

    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});