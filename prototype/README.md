# Memory Impact Lab Demo

Run the local server from the repository root:

```bash
DEEPSEEK_API_KEY=your_key python3 prototype/server.py
```

Then open one of the two interfaces:

- Exploratory workspace: <http://127.0.0.1:8000>
- Single-trial study flow: <http://127.0.0.1:8000/study.html>

Optional environment variables:

```bash
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEMO_HOST=127.0.0.1
DEMO_PORT=8000
```

The API key stays in the local Python process. The browser sends planning requests
to `/api/plan` and never receives the key.
