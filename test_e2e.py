import asyncio
import json
import subprocess
import sys
import tempfile
import urllib.request
import websockets

sys.stdout.reconfigure(encoding='utf-8')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
URL = "http://localhost:3000/"

async def test_app():
    user_data_dir = tempfile.mkdtemp(prefix="chrome_test_")
    port = 9333
    
    cmd = [
        CHROME_PATH,
        "--headless=new",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data_dir}",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        URL
    ]
    
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("Launched Chrome, PID:", proc.pid)
    
    try:
        ws_url = None
        for _ in range(20):
            await asyncio.sleep(0.5)
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{port}/json") as resp:
                    tabs = json.loads(resp.read().decode())
                    for t in tabs:
                        if t.get("type") == "page":
                            ws_url = t.get("webSocketDebuggerUrl")
                            break
                    if ws_url:
                        break
            except Exception:
                pass
                
        if not ws_url:
            print("Failed to get WebSocket debugger URL")
            return

        async with websockets.connect(ws_url, max_size=50*1024*1024) as ws:
            msg_id = 0
            console_errors = []
            
            async def send_cmd(method, params=None):
                nonlocal msg_id
                msg_id += 1
                payload = {"id": msg_id, "method": method}
                if params:
                    payload["params"] = params
                await ws.send(json.dumps(payload))
                while True:
                    res = await ws.recv()
                    data = json.loads(res)
                    if "method" in data:
                        if data["method"] == "Runtime.exceptionThrown":
                            console_errors.append(data["params"])
                    if data.get("id") == msg_id:
                        return data.get("result")

            await send_cmd("Page.enable")
            await send_cmd("Runtime.enable")
            
            await asyncio.sleep(2)
            
            # 1. Test In-Charge Default View
            title_res = await send_cmd("Runtime.evaluate", {"expression": "document.title", "returnByValue": True})
            print("Page Title:", title_res.get("result", {}).get("value"))
            
            h1_res = await send_cmd("Runtime.evaluate", {"expression": "document.querySelector('h1').innerText", "returnByValue": True})
            print("Initial H1:", h1_res.get("result", {}).get("value"))
            
            # 2. Test Switch to Student Role
            print("\n--- Testing Role Switch to Student ---")
            switch_res = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const sel = document.getElementById('roleSelect');
                    sel.value = 'student';
                    sel.dispatchEvent(new Event('change'));
                    return document.querySelector('h1').innerText;
                })()
                """,
                "returnByValue": True
            })
            print("Student H1:", switch_res.get("result", {}).get("value"))
            
            # Check student stats
            stu_stats = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const cards = Array.from(document.querySelectorAll('.stat-card .stat-value')).map(c => c.innerText.trim());
                    return cards;
                })()
                """,
                "returnByValue": True
            })
            print("Student Stat Cards:", stu_stats.get("result", {}).get("value"))
            
            # 3. Test Switch to Proctor Role
            print("\n--- Testing Role Switch to Proctor ---")
            switch_proctor = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const sel = document.getElementById('roleSelect');
                    sel.value = 'proctor';
                    sel.dispatchEvent(new Event('change'));
                    return document.querySelector('h1').innerText;
                })()
                """,
                "returnByValue": True
            })
            print("Proctor H1:", switch_proctor.get("result", {}).get("value"))
            
            # 4. Test Navigation to Requests Page
            print("\n--- Testing Navigation to Requests ---")
            nav_req = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    location.hash = '#requests';
                    window.dispatchEvent(new Event('hashchange'));
                    return document.querySelector('h1').innerText;
                })()
                """,
                "returnByValue": True
            })
            print("Requests H1:", nav_req.get("result", {}).get("value"))
            
            # 5. Test Navigation to Attendance Registry
            print("\n--- Testing Navigation to Attendance Registry ---")
            nav_att = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    location.hash = '#attendance';
                    window.dispatchEvent(new Event('hashchange'));
                    return {
                        h1: document.querySelector('h1').innerText,
                        rowCount: document.querySelectorAll('#attTableRows tr').length
                    };
                })()
                """,
                "returnByValue": True
            })
            print("Attendance Info:", nav_att.get("result", {}).get("value"))
            
            # Check console errors
            print("\n--- Console Errors Encountered ---")
            print("Errors count:", len(console_errors))
            for err in console_errors:
                print("Error:", err)
                
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except Exception:
            proc.kill()

if __name__ == "__main__":
    asyncio.run(test_app())
