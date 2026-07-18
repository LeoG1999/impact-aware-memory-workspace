#!/usr/bin/env python3
"""Local static server and DeepSeek proxy for the memory impact demo."""

import json
import mimetypes
import os
import re
import sys
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "frontend"
HOST = os.environ.get("DEMO_HOST", "127.0.0.1")
PORT = int(os.environ.get("DEMO_PORT", "8000"))
DEEPSEEK_URL = os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
DEEPSEEK_MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash")

CATALOG = {
    "hotels": [
        {"name": "Kyoto Station Garden Hotel", "area": "Kyoto Station", "cost_per_night": 165, "traits": ["step-free", "family-friendly", "excellent-transit", "modern"]},
        {"name": "Gion Machiya Stay", "area": "Gion", "cost_per_night": 145, "traits": ["central", "traditional", "local-character", "stairs", "solo-friendly"]},
        {"name": "Arashiyama Riverside Ryokan", "area": "Arashiyama", "cost_per_night": 215, "traits": ["traditional", "onsen", "quiet", "far-from-center"]},
        {"name": "Karasuma Compact Hotel", "area": "Karasuma", "cost_per_night": 110, "traits": ["central", "good-value", "small-rooms", "excellent-transit"]},
    ],
    "activities": [
        {"name": "Gion tea ceremony", "area": "Gion", "cost": 45, "duration_minutes": 90, "traits": ["local-culture", "low-walking", "quiet", "small-group"]},
        {"name": "Nishiki Market tasting walk", "area": "Downtown", "cost": 32, "duration_minutes": 120, "traits": ["food", "local-culture", "moderate-walking", "crowded"]},
        {"name": "Kiyomizu-dera and old lanes", "area": "Higashiyama", "cost": 12, "duration_minutes": 180, "traits": ["heritage", "high-walking", "stairs", "crowded"]},
        {"name": "Kyoto Railway Museum", "area": "Kyoto Station", "cost": 15, "duration_minutes": 150, "traits": ["family-friendly", "low-walking", "indoor"]},
        {"name": "Kyo-yuzen dyeing workshop", "area": "Karasuma", "cost": 58, "duration_minutes": 120, "traits": ["craft", "local-culture", "low-walking", "solo-friendly"]},
        {"name": "Philosopher's Path walk", "area": "Northern Higashiyama", "cost": 0, "duration_minutes": 150, "traits": ["nature", "high-walking", "quiet"]},
        {"name": "Arashiyama bamboo grove", "area": "Arashiyama", "cost": 0, "duration_minutes": 150, "traits": ["nature", "high-walking", "crowded", "early-start-helpful"]},
        {"name": "Tenryu-ji garden", "area": "Arashiyama", "cost": 8, "duration_minutes": 90, "traits": ["heritage", "nature", "moderate-walking"]},
        {"name": "Zen meditation session", "area": "Northern Kyoto", "cost": 30, "duration_minutes": 75, "traits": ["local-culture", "quiet", "low-walking", "early-start"]},
        {"name": "Pontocho evening food tour", "area": "Pontocho", "cost": 88, "duration_minutes": 180, "traits": ["food", "adult-oriented", "late-evening", "moderate-walking"]},
        {"name": "Kyoto International Manga Museum", "area": "Karasuma", "cost": 10, "duration_minutes": 120, "traits": ["indoor", "family-friendly", "low-walking"]},
        {"name": "Fushimi Inari short route", "area": "Fushimi", "cost": 0, "duration_minutes": 120, "traits": ["heritage", "moderate-walking", "stairs", "early-start-helpful"]},
    ],
    "restaurants": [
        {"name": "Mumokuteki Cafe", "area": "Downtown", "cost": 30, "traits": ["vegetarian", "casual", "central"]},
        {"name": "Shigetsu temple cuisine", "area": "Arashiyama", "cost": 48, "traits": ["vegetarian", "traditional", "quiet"]},
        {"name": "Gion Soy Milk Ramen", "area": "Gion", "cost": 22, "traits": ["vegetarian", "casual", "small"]},
        {"name": "Izusen garden shojin lunch", "area": "Northern Kyoto", "cost": 52, "traits": ["vegetarian", "traditional", "quiet"]},
        {"name": "Pontocho Yakitori Counter", "area": "Pontocho", "cost": 38, "traits": ["adult-oriented", "late-evening", "not-vegetarian"]},
        {"name": "Kyoto Station Family Dining", "area": "Kyoto Station", "cost": 26, "traits": ["family-friendly", "vegetarian-options", "convenient"]},
    ],
    "transit": [
        {"name": "Bus and subway day pass", "cost": 8, "traits": ["flexible", "moderate-walking"]},
        {"name": "Taxi transfer", "cost": 24, "traits": ["low-walking", "fast"]},
        {"name": "JR/local rail transfer", "cost": 7, "traits": ["fast", "station-access"]},
    ],
}

SYSTEM_PROMPT = """你是一个个性化旅行规划 agent。根据用户请求、持久记忆和封闭目录生成一份可执行的京都三日计划。

重要约束：
1. 只能选择目录中存在的酒店、活动、餐厅和交通，不得虚构项目或价格。
2. 持久记忆会影响语义权衡。status=stale 仍然可被使用，但应在 tradeoffs 中指出风险。
3. 三晚住宿成本计入 total_cost。活动、餐饮和明确列出的交通也计入总成本。
4. 使用稳定决策槽位 ID：hotel_base；d1_morning、d1_lunch、d1_afternoon、d1_dinner；d2_*；d3_*。即使选择变化，ID 也不得变化。
5. memory_ids 只能列出真实参与该决策的记忆 ID。depends_on 列出导致当前决策受到影响的其他决策槽位 ID。
6. 对每个 memory 在 memory_usage 中说明它直接影响了哪些决策槽位；未使用则 role=unused。
7. 只输出 JSON，不要 markdown，不要输出思维过程。
8. 如果 task 是 counterfactual，reference_plan 是修改前的基线。只改变 memory_intervention 必然影响的选择；不受影响的槽位必须原样保留。不要为了语言多样性改写 title、time、location、cost 或 duration_minutes。

JSON schema：
{
  "title": "string",
  "summary": "string",
  "total_cost": 0,
  "strategy": "string",
  "lodging": {
    "id": "hotel_base", "time": "3 nights", "title": "catalog name", "type": "hotel",
    "location": "string", "cost": 0, "duration_minutes": 0, "description": "string",
    "memory_ids": ["memory_id"], "depends_on": []
  },
  "days": [
    {"day": 1, "theme": "string", "items": [
      {"id": "d1_morning", "time": "09:30", "title": "catalog name", "type": "activity|meal|transit|rest",
       "location": "string", "cost": 0, "duration_minutes": 90, "description": "string",
       "memory_ids": ["memory_id"], "depends_on": ["hotel_base"]}
    ]}
  ],
  "tradeoffs": ["string"],
  "memory_usage": [
    {"memory_id": "memory_id", "role": "direct|supporting|unused", "decisions": ["decision_id"], "explanation": "string"}
  ]
}
"""


def safe_json_loads(raw):
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw)


def validate_plan(plan):
    if not isinstance(plan, dict):
        raise ValueError("DeepSeek did not return a JSON object")
    required = ("title", "summary", "total_cost", "days", "memory_usage")
    missing = [key for key in required if key not in plan]
    if missing:
        raise ValueError("DeepSeek response is missing: " + ", ".join(missing))
    if not isinstance(plan["days"], list) or len(plan["days"]) != 3:
        raise ValueError("DeepSeek response must contain exactly three days")
    seen_ids = set()
    if isinstance(plan.get("lodging"), dict):
        seen_ids.add(plan["lodging"].get("id"))
    for day in plan["days"]:
        if not isinstance(day.get("items"), list):
            raise ValueError("Every day must contain an items list")
        for item in day["items"]:
            item_id = item.get("id")
            if not item_id or item_id in seen_ids:
                raise ValueError("Decision IDs must be present and unique")
            seen_ids.add(item_id)
            item.setdefault("memory_ids", [])
            item.setdefault("depends_on", [])
            item.setdefault("description", "")
            item.setdefault("cost", 0)
            item.setdefault("duration_minutes", 0)
    plan.setdefault("tradeoffs", [])
    plan.setdefault("strategy", "")
    return plan


def deepseek_plan(user_request, memories, mode, intervention=None, reference_plan=None):
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        raise RuntimeError("DEEPSEEK_API_KEY is not configured")

    user_payload = {
        "task": "Generate a baseline plan" if mode == "baseline" else "Generate a counterfactual plan after one memory intervention",
        "user_request": user_request,
        "persistent_memories": memories,
        "catalog": CATALOG,
    }
    if mode == "counterfactual":
        user_payload["memory_intervention"] = intervention
        user_payload["reference_plan"] = reference_plan
    payload = {
        "model": DEEPSEEK_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)},
        ],
        "thinking": {"type": "disabled"},
        "temperature": 0.2,
        "max_tokens": 6000,
        "response_format": {"type": "json_object"},
        "stream": False,
    }
    request = urllib.request.Request(
        DEEPSEEK_URL + "/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": "Bearer " + api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=150) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")[:800]
        raise RuntimeError(f"DeepSeek API returned {exc.code}: {details}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Could not reach DeepSeek API: {exc.reason}") from exc

    choices = result.get("choices") or []
    if not choices:
        raise RuntimeError("DeepSeek API returned no choices")
    content = choices[0].get("message", {}).get("content")
    if not content:
        raise RuntimeError("DeepSeek API returned an empty plan")
    return validate_plan(safe_json_loads(content)), result.get("model", DEEPSEEK_MODEL), result.get("usage", {})


class DemoHandler(BaseHTTPRequestHandler):
    server_version = "MemoryImpactDemo/1.0"

    def log_message(self, fmt, *args):
        sys.stdout.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))
        sys.stdout.flush()

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/health":
            self.send_json(200, {"ok": True, "configured": bool(os.environ.get("DEEPSEEK_API_KEY")), "model": DEEPSEEK_MODEL})
            return

        relative = "index.html" if path == "/" else path.lstrip("/")
        target = (FRONTEND / relative).resolve()
        if FRONTEND.resolve() not in target.parents and target != FRONTEND.resolve():
            self.send_error(403)
            return
        if not target.is_file():
            self.send_error(404)
            return
        content = target.read_bytes()
        content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", content_type + ("; charset=utf-8" if content_type.startswith("text/") or content_type == "application/javascript" else ""))
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(content)

    def do_POST(self):
        if urlparse(self.path).path != "/api/plan":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 200_000:
                raise ValueError("Invalid request size")
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            user_request = str(payload.get("request", "")).strip()
            memories = payload.get("memories")
            mode = payload.get("mode", "baseline")
            intervention = payload.get("intervention")
            reference_plan = payload.get("reference_plan")
            if not user_request or len(user_request) > 4000:
                raise ValueError("A valid trip request is required")
            if not isinstance(memories, list) or not 1 <= len(memories) <= 30:
                raise ValueError("A valid memory list is required")
            if mode not in ("baseline", "counterfactual"):
                raise ValueError("Invalid planning mode")
            if mode == "counterfactual":
                if not isinstance(intervention, dict) or not intervention.get("memory_id"):
                    raise ValueError("A counterfactual intervention is required")
                if not isinstance(reference_plan, dict):
                    raise ValueError("A baseline reference plan is required")
            plan, model, usage = deepseek_plan(user_request, memories, mode, intervention, reference_plan)
            self.send_json(200, {"plan": plan, "model": model, "usage": usage})
        except ValueError as exc:
            self.send_json(400, {"error": str(exc)})
        except Exception as exc:
            self.log_message("plan generation failed: %s", exc)
            self.send_json(502, {"error": str(exc)})


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), DemoHandler)
    print(f"Memory Impact Lab running at http://{HOST}:{PORT}")
    print(f"DeepSeek model: {DEEPSEEK_MODEL}; API key configured: {bool(os.environ.get('DEEPSEEK_API_KEY'))}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
