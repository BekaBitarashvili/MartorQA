import httpx
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent.parent / ".env")

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5-coder:7b"


def build_prompt(test_description: str) -> str:
    return f"""Convert the following test description into a JSON array of test steps.

RULES:
- Return ONLY a valid JSON array, nothing else
- No explanation, no markdown, no code blocks
- Use only these actions: open, type, click, wait, select, scroll

Action formats:
{{"action": "open", "url": "https://..."}}
{{"action": "type", "target": "description of input field", "value": "text to type"}}
{{"action": "click", "target": "description of element to click"}}
{{"action": "wait", "seconds": 3}}
{{"action": "select", "target": "description of dropdown", "value": "option to select"}}
{{"action": "scroll", "direction": "down"}}

Examples:
Input: "open google.com and search for python"
Output: [{{"action": "open", "url": "https://google.com"}}, {{"action": "type", "target": "search input", "value": "python"}}, {{"action": "click", "target": "search button"}}]

Input: "go to github.com login page and enter email and password"
Output: [{{"action": "open", "url": "https://github.com/login"}}, {{"action": "type", "target": "email input", "value": "test@example.com"}}, {{"action": "type", "target": "password input", "value": "password123"}}, {{"action": "click", "target": "sign in button"}}]

Test description:
{test_description}

JSON array:"""


async def generate_steps(test_description: str) -> list:
    prompt = build_prompt(test_description)

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            result = response.json()
            raw = result["response"].strip()

            print(f"LLM raw output: {raw}")

            # markdown blocks ამოვიღოთ თუ არის
            if "```" in raw:
                lines = raw.split('\n')
                cleaned = []
                inside = False
                for line in lines:
                    if line.strip().startswith('```'):
                        inside = not inside
                        continue
                    cleaned.append(line)
                raw = '\n'.join(cleaned).strip()

            # პირველი [ და ბოლო ] ვიპოვოთ
            start = raw.find('[')
            end = raw.rfind(']')
            if start != -1 and end != -1:
                raw = raw[start:end+1]

            steps = json.loads(raw)
            return steps

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}, raw: {raw}")
        raise ValueError(f"Could not parse steps from LLM output")
    except Exception as e:
        print(f"Error: {str(e)}")
        raise


async def generate_test_code(test_description: str) -> str:
    steps = await generate_steps(test_description)
    return steps_to_code(steps)


def steps_to_code(steps: list) -> str:
    lines = [
        "from playwright.sync_api import sync_playwright",
        "import time",
        "",
        "with sync_playwright() as p:",
        "    browser = p.chromium.launch(headless=False)",
        "    page = browser.new_page()",
        "",
    ]

    for step in steps:
        action = step.get("action")

        if action == "open":
            url = step.get("url", "")
            if not url.startswith("http"):
                url = "https://" + url
            lines.append(f'    page.goto("{url}")')
            lines.append(f'    page.wait_for_load_state("networkidle")')

        elif action == "type":
            target = step.get("target", "")
            value = step.get("value", "")
            lines.append(f'    # type into: {target}')
            lines.append(f'    _find_and_type(page, "{target}", "{value}")')

        elif action == "click":
            target = step.get("target", "")
            lines.append(f'    # click: {target}')
            lines.append(f'    _find_and_click(page, "{target}")')

        elif action == "wait":
            seconds = step.get("seconds", 1)
            lines.append(f'    time.sleep({seconds})')

        elif action == "scroll":
            direction = step.get("direction", "down")
            if direction == "down":
                lines.append(f'    page.mouse.wheel(0, 500)')
            else:
                lines.append(f'    page.mouse.wheel(0, -500)')

        elif action == "select":
            target = step.get("target", "")
            value = step.get("value", "")
            lines.append(f'    # select: {target}')
            lines.append(f'    _find_and_select(page, "{target}", "{value}")')

        lines.append("")

    lines.append("    browser.close()")
    return "\n".join(lines)