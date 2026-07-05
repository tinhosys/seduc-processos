const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

// Remove authMiddleware definition
server = server.replace(/const authMiddleware = \(req, res, next\) => \{[\s\S]*?res\.status\(401\)\.json\(\{ erro: "Não autorizado\. Faça o login novamente\." \}\);\s*\}\s*\};\s*/, '');

// Remove /api/logins
server = server.replace(/app\.get\("\/api\/logins", async \(req, res\) => \{[\s\S]*?res\.json\(\[\]\);\s*\}\s*\}\);\s*/, '');

// Remove /api/login
server = server.replace(/app\.post\("\/api\/login", async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ erro: "Erro ao verificar senha\." \}\);\s*\}\s*\}\);\s*/, '');

// Remove authMiddleware from routes
server = server.replace(/app\.get\("\/api\/registros", authMiddleware, async \(req, res\) => \{/g, 'app.get("/api/registros", async (req, res) => {');
server = server.replace(/app\.put\("\/api\/registros\/:id", authMiddleware, async \(req, res\) => \{/g, 'app.put("/api/registros/:id", async (req, res) => {');
server = server.replace(/app\.post\("\/api\/registros", authMiddleware, async \(req, res\) => \{/g, 'app.post("/api/registros", async (req, res) => {');
server = server.replace(/app\.delete\("\/api\/registros\/:id", authMiddleware, async \(req, res\) => \{/g, 'app.delete("/api/registros/:id", async (req, res) => {');

fs.writeFileSync('server.js', server, 'utf8');
console.log('server.js reverted');
