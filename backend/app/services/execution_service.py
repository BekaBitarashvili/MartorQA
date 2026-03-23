"""
MartorQA Execution Service
Hybrid approach: LLM generates steps → Selector Engine finds real elements → Playwright executes
"""

import sys
import json
import subprocess
import tempfile
import os


def steps_to_executable_code(steps: list) -> str:
    """Convert steps JSON to executable Playwright code with smart selector engine"""

    code = '''import sys
import time
from playwright.sync_api import sync_playwright


def normalize(text):
    return text.lower().strip()


def find_input(page, description):
    desc = normalize(description)
    inputs = page.locator("input:visible, textarea:visible")
    count = inputs.count()

    for i in range(count):
        el = inputs.nth(i)
        try:
            placeholder = (el.get_attribute("placeholder") or "").lower()
            name = (el.get_attribute("name") or "").lower()
            aria_label = (el.get_attribute("aria-label") or "").lower()
            type_attr = (el.get_attribute("type") or "text").lower()

            if type_attr in ["hidden", "submit", "button", "checkbox", "radio"]:
                continue

            combined = f"{placeholder} {name} {aria_label}"

            if any(word in combined for word in desc.split() if len(word) > 2):
                return el

            search_kw = ["search", "q", "query"]
            email_kw = ["email", "mail"]
            password_kw = ["password", "pass", "pwd"]

            if any(k in desc for k in search_kw) and any(k in combined for k in search_kw):
                return el
            if any(k in desc for k in email_kw) and any(k in combined for k in email_kw):
                return el
            if any(k in desc for k in password_kw) and any(k in combined for k in password_kw):
                return el

        except Exception:
            continue

    try:
        fallback = page.locator("input[type=\'text\']:visible, input:not([type]):visible, textarea:visible")
        if fallback.count() > 0:
            return fallback.first
    except Exception:
        pass

    return None


def find_button(page, description):
    desc = normalize(description)

    try:
        for word in desc.split():
            if len(word) > 2:
                locator = page.get_by_role("button", name=word, exact=False)
                if locator.count() > 0:
                    return locator.first
    except Exception:
        pass

    try:
        submit = page.locator("input[type=\'submit\']:visible")
        if submit.count() > 0:
            return submit.first
    except Exception:
        pass

    try:
        buttons = page.locator("button:visible")
        if buttons.count() > 0:
            return buttons.first
    except Exception:
        pass

    return None


def find_element(page, description):
    desc = normalize(description)

    nth_map = {"first": 0, "second": 1, "third": 2, "fourth": 3,
               "1st": 0, "2nd": 1, "3rd": 2, "4th": 3}
    nth_index = None
    for word, idx in nth_map.items():
        if word in desc:
            nth_index = idx
            break

    if any(kw in desc for kw in ["result", "link", "offer", "item"]):
        try:
            links = page.locator("a:visible")
            if nth_index is not None and links.count() > nth_index:
                return links.nth(nth_index)
            elif links.count() > 0:
                return links.first
        except Exception:
            pass

    is_input = any(kw in desc for kw in ["input", "field", "search", "email", "password", "text", "box"])
    is_button = any(kw in desc for kw in ["button", "btn", "submit", "click", "sign"])

    if is_input and not is_button:
        return find_input(page, description)
    if is_button:
        result = find_button(page, description)
        if result:
            return result

    result = find_input(page, description)
    if result:
        return result
    return find_button(page, description)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.set_default_timeout(10000)

'''

    # generate step executions
    for i, step in enumerate(steps):
        action = step.get("action")

        if action == "open":
            url = step.get("url", "")
            if not url.startswith("http"):
                url = "https://" + url
            code += f'    print("Step {i+1}: Opening {url}")\n'
            code += f'    page.goto("{url}")\n'
            code += f'    page.wait_for_load_state("networkidle")\n\n'

        elif action == "type":
            target = step.get("target", "")
            value = step.get("value", "")
            code += f'    print("Step {i+1}: Typing into {target}")\n'
            code += f'    el = find_input(page, "{target}")\n'
            code += f'    if el:\n'
            code += f'        el.click()\n'
            code += f'        el.fill("{value}")\n'
            code += f'        print("  -> typed successfully")\n'
            code += f'    else:\n'
            code += f'        print("  -> WARNING: could not find input: {target}")\n\n'

        elif action == "click":
            target = step.get("target", "")
            code += f'    print("Step {i+1}: Clicking {target}")\n'
            code += f'    el = find_element(page, "{target}")\n'
            code += f'    if el:\n'
            code += f'        el.click()\n'
            code += f'        print("  -> clicked successfully")\n'
            code += f'    else:\n'
            code += f'        print("  -> WARNING: could not find element: {target}")\n\n'

        elif action == "wait":
            seconds = step.get("seconds", 1)
            code += f'    print("Step {i+1}: Waiting {seconds} seconds")\n'
            code += f'    time.sleep({seconds})\n\n'

        elif action == "scroll":
            direction = step.get("direction", "down")
            delta = 500 if direction == "down" else -500
            code += f'    print("Step {i+1}: Scrolling {direction}")\n'
            code += f'    page.mouse.wheel(0, {delta})\n\n'

        elif action == "select":
            target = step.get("target", "")
            value = step.get("value", "")
            code += f'    print("Step {i+1}: Selecting {value} in {target}")\n'
            code += f'    el = find_element(page, "{target}")\n'
            code += f'    if el:\n'
            code += f'        el.select_option("{value}")\n'
            code += f'        print("  -> selected successfully")\n'
            code += f'    else:\n'
            code += f'        print("  -> WARNING: could not find select: {target}")\n\n'

    code += '    print("\\nAll steps completed successfully!")\n'
    code += '    browser.close()\n'

    return code


def run_steps(steps: list) -> dict:
    """Execute steps using the selector engine"""
    code = steps_to_executable_code(steps)

    with tempfile.NamedTemporaryFile(
        mode='w',
        suffix='.py',
        delete=False,
        encoding='utf-8'
    ) as f:
        f.write(code)
        tmp_path = f.name

    try:
        result = subprocess.run(
            [sys.executable, tmp_path],
            capture_output=True,
            text=True,
            timeout=120,
        )
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
            "code": code,
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "stdout": "",
            "stderr": "Execution timed out after 120 seconds",
            "returncode": -1,
            "code": code,
        }
    finally:
        os.unlink(tmp_path)


def run_playwright_code(code: str) -> dict:
    """Legacy: run raw playwright code directly"""
    if "```" in code:
        lines = code.split('\n')
        cleaned = []
        inside_block = False
        for line in lines:
            if line.strip().startswith('```'):
                inside_block = not inside_block
                continue
            cleaned.append(line)
        code = '\n'.join(cleaned)

    code = code.replace('headless=True', 'headless=False')
    code = code.replace('chromium.launch()', 'chromium.launch(headless=False)')

    with tempfile.NamedTemporaryFile(
        mode='w',
        suffix='.py',
        delete=False,
        encoding='utf-8'
    ) as f:
        f.write(code)
        tmp_path = f.name

    try:
        result = subprocess.run(
            [sys.executable, tmp_path],
            capture_output=True,
            text=True,
            timeout=120,
        )
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
            "code": code,
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "stdout": "",
            "stderr": "Execution timed out",
            "returncode": -1,
            "code": code,
        }
    finally:
        os.unlink(tmp_path)