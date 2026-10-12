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

async def test_workflow():
    user_data_dir = tempfile.mkdtemp(prefix="chrome_wf_")
    port = 9444
    
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

        async with websockets.connect(ws_url, max_size=50*1024*1024) as ws:
            msg_id = 0
            
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
                    if data.get("id") == msg_id:
                        return data.get("result")

            await send_cmd("Page.enable")
            await send_cmd("Runtime.enable")
            await asyncio.sleep(1)
            
            # Step 0: Ensure authenticated as Student
            print("--- 0. Authenticating as Student ---")
            await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const loginScreen = document.getElementById('loginScreen');
                    if (loginScreen && window.getComputedStyle(loginScreen).display !== 'none') {
                        document.getElementById('formStudentLogin').dispatchEvent(new Event('submit', { cancelable: true }));
                    }
                })()
                """
            })
            await asyncio.sleep(0.5)

            # Step 1: Submit new request as Student
            print("--- 1. Submitting Request as Student ---")
            res_sub = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const sel = document.getElementById('roleSelect');
                    if (sel) {
                        sel.value = 'student';
                        sel.dispatchEvent(new Event('change'));
                    }
                    
                    document.getElementById('btnOpenNewRequest').click();
                    
                    document.getElementById('reqEventTitle').value = 'Test Cloud Hackathon 2026';
                    document.getElementById('reqOrganizer').value = 'Google Cloud Team';
                    document.getElementById('reqCategory').value = 'Hackathon';
                    document.getElementById('reqStartDate').value = '2026-12-01';
                    document.getElementById('reqEndDate').value = '2026-12-03';
                    document.getElementById('reqVenue').value = 'Bangalore Tech Park';
                    document.getElementById('reqPurpose').value = 'Building serverless generative agents.';
                    
                    document.getElementById('requestForm').dispatchEvent(new Event('submit', { cancelable: true }));
                    
                    const rows = Array.from(document.querySelectorAll('tbody tr td strong')).map(e => e.innerText);
                    return rows.slice(0, 5);
                })()
                """,
                "returnByValue": True
            })
            print("Submitted Rows Preview:", res_sub.get("result", {}).get("value"))
            
            # Step 2: Switch to Proctor and check review queue
            print("\n--- 2. Checking Proctor Queue ---")
            res_proc = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const sel = document.getElementById('roleSelect');
                    sel.value = 'proctor';
                    sel.dispatchEvent(new Event('change'));
                    
                    const queueButtons = Array.from(document.querySelectorAll('[data-proctor-review]')).map(b => b.getAttribute('data-proctor-review'));
                    return queueButtons;
                })()
                """,
                "returnByValue": True
            })
            print("Proctor Actionable Requests:", res_proc.get("result", {}).get("value"))
            
            # Step 3: Recommend approval on the first pending request
            print("\n--- 3. Proctor Recommending Approval ---")
            rec_res = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const firstBtn = document.querySelector('[data-proctor-review]');
                    if (firstBtn) {
                        firstBtn.click();
                        document.getElementById('proctorDecision').value = 'Recommended for Approval';
                        document.getElementById('proctorRemarks').value = 'Student maintains strong 87.5% attendance and merits participation.';
                        document.getElementById('proctorForm').dispatchEvent(new Event('submit', { cancelable: true }));
                        return 'Recommended successfully';
                    }
                    return 'No button';
                })()
                """,
                "returnByValue": True
            })
            print("Recommendation Result:", rec_res.get("result", {}).get("value"))
            
            # Step 4: Switch to In-Charge and make final approval
            print("\n--- 4. In-Charge Final Approval ---")
            app_res = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const sel = document.getElementById('roleSelect');
                    sel.value = 'admin';
                    sel.dispatchEvent(new Event('change'));
                    
                    const firstDecide = document.querySelector('[data-incharge-decide]');
                    if (firstDecide) {
                        firstDecide.click();
                        document.getElementById('inchargeDecision').value = 'Approved';
                        document.getElementById('inchargeRemarks').value = 'Final institutional on-duty approval granted.';
                        document.getElementById('inchargeForm').dispatchEvent(new Event('submit', { cancelable: true }));
                        return 'Approved successfully';
                    }
                    return 'No decide button';
                })()
                """,
                "returnByValue": True
            })
            print("In-Charge Final Decision Result:", app_res.get("result", {}).get("value"))
            
            print("\nWorkflow cycle completed without errors!")
            
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except Exception:
            proc.kill()

if __name__ == "__main__":
    asyncio.run(test_workflow())
