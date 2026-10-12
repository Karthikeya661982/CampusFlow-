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

async def test_login_flow():
    user_data_dir = tempfile.mkdtemp(prefix="chrome_login_test_")
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
    print("Launched Chrome for Login Interface Verification, PID:", proc.pid)
    
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
            
            # Step 1: Initial Login Interface Check
            print("\n=== STEP 1: Verify Initial Login Screen ===")
            init_check = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const loginScreen = document.getElementById('loginScreen');
                    const appShell = document.getElementById('appShell');
                    const loginTitle = document.querySelector('.login-portal-title') ? document.querySelector('.login-portal-title').innerText : '';
                    const instTitle = document.querySelector('.inst-subtitle') ? document.querySelector('.inst-subtitle').innerText : '';
                    const tabs = Array.from(document.querySelectorAll('.login-tab-btn')).map(b => b.innerText.trim());
                    const activePanel = document.querySelector('.login-role-panel.active') ? document.querySelector('.login-role-panel.active').id : '';
                    
                    return {
                        loginVisible: window.getComputedStyle(loginScreen).display !== 'none',
                        appHidden: window.getComputedStyle(appShell).display === 'none',
                        docTitle: document.title,
                        instSubtitle: instTitle,
                        loginTitle: loginTitle,
                        tabs: tabs,
                        activePanel: activePanel
                    };
                })()
                """,
                "returnByValue": True
            })
            val1 = init_check.get("result", {}).get("value")
            print("1. Login Screen Visible:", val1.get("loginVisible"))
            print("2. App Shell Hidden:", val1.get("appHidden"))
            print("3. Page Title:", val1.get("docTitle"))
            print("4. Institution Subtitle:", val1.get("instSubtitle"))
            print("5. Login Portal Title:", val1.get("loginTitle"))
            print("6. Role Tabs:", val1.get("tabs"))
            print("7. Active Panel:", val1.get("activePanel"))
            
            assert val1.get("loginVisible") is True, "Login screen should be visible initially"
            assert val1.get("appHidden") is True, "App shell should be hidden initially"
            assert "Siddhartha Academy of Higher Education" in val1.get("docTitle"), "Title must contain Siddhartha Academy of Higher Education"
            
            # Step 2: Test Tab Switching
            print("\n=== STEP 2: Verify Login Tab Switching ===")
            tab_switch = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    document.getElementById('tabProctor').click();
                    const p1 = document.querySelector('.login-role-panel.active').id;
                    
                    document.getElementById('tabIncharge').click();
                    const p2 = document.querySelector('.login-role-panel.active').id;
                    
                    document.getElementById('tabStudent').click();
                    const p3 = document.querySelector('.login-role-panel.active').id;
                    
                    return { proctorPanel: p1, inchargePanel: p2, studentPanel: p3 };
                })()
                """,
                "returnByValue": True
            })
            tabs_res = tab_switch.get("result", {}).get("value")
            print("Tab Switch Results:", tabs_res)
            assert tabs_res.get("proctorPanel") == "panelProctor"
            assert tabs_res.get("inchargePanel") == "panelIncharge"
            assert tabs_res.get("studentPanel") == "panelStudent"

            # Step 3: Test Student Login Flow
            print("\n=== STEP 3: Student Login Workflow ===")
            stu_login = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    document.getElementById('loginStudentRoll').value = '25EU02094';
                    document.getElementById('loginStudentPin').value = 'student123';
                    document.getElementById('formStudentLogin').dispatchEvent(new Event('submit', { cancelable: true }));
                    
                    const loginScreen = document.getElementById('loginScreen');
                    const appShell = document.getElementById('appShell');
                    const welcomeH1 = document.querySelector('#content h1') ? document.querySelector('#content h1').innerText : '';
                    const roleSelectVal = document.getElementById('roleSelect') ? document.getElementById('roleSelect').value : '';
                    const firstStat = document.querySelector('.stat-card .stat-value') ? document.querySelector('.stat-card .stat-value').innerText.trim() : '';
                    
                    return {
                        loginVisible: window.getComputedStyle(loginScreen).display !== 'none',
                        appVisible: window.getComputedStyle(appShell).display !== 'none',
                        h1: welcomeH1,
                        activeRole: roleSelectVal,
                        attendanceStat: firstStat
                    };
                })()
                """,
                "returnByValue": True
            })
            val3 = stu_login.get("result", {}).get("value")
            print("Student Login Result:", val3)
            assert val3.get("loginVisible") is False, "Login screen should be hidden after login"
            assert val3.get("appVisible") is True, "App shell should be visible after login"
            assert "Madupu Karthikeya" in val3.get("h1"), "Welcome header must show student name"
            assert val3.get("activeRole") == "student"

            # Step 4: Test Sign Out
            print("\n=== STEP 4: Sign Out Workflow ===")
            signout_res = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    document.getElementById('btnTopLogout').click();
                    const loginScreen = document.getElementById('loginScreen');
                    const appShell = document.getElementById('appShell');
                    return {
                        loginVisible: window.getComputedStyle(loginScreen).display !== 'none',
                        appHidden: window.getComputedStyle(appShell).display === 'none'
                    };
                })()
                """,
                "returnByValue": True
            })
            val4 = signout_res.get("result", {}).get("value")
            print("Sign Out Result:", val4)
            assert val4.get("loginVisible") is True, "Login screen must be visible after logout"
            assert val4.get("appHidden") is True, "App shell must be hidden after logout"

            # Step 5: Test Faculty Proctor Login Flow
            print("\n=== STEP 5: Faculty Proctor Login Workflow ===")
            proc_login = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    document.getElementById('tabProctor').click();
                    document.getElementById('loginProctorId').value = 'P1001';
                    document.getElementById('loginProctorPin').value = 'proctor123';
                    document.getElementById('formProctorLogin').dispatchEvent(new Event('submit', { cancelable: true }));
                    
                    const loginScreen = document.getElementById('loginScreen');
                    const appShell = document.getElementById('appShell');
                    const welcomeH1 = document.querySelector('#content h1') ? document.querySelector('#content h1').innerText : '';
                    const roleSelectVal = document.getElementById('roleSelect') ? document.getElementById('roleSelect').value : '';
                    const cards = Array.from(document.querySelectorAll('.stat-card .stat-top span:first-child')).map(s => s.innerText.trim());
                    
                    return {
                        loginVisible: window.getComputedStyle(loginScreen).display !== 'none',
                        appVisible: window.getComputedStyle(appShell).display !== 'none',
                        h1: welcomeH1,
                        activeRole: roleSelectVal,
                        statLabels: cards
                    };
                })()
                """,
                "returnByValue": True
            })
            val5 = proc_login.get("result", {}).get("value")
            print("Proctor Login Result:", val5)
            assert val5.get("loginVisible") is False
            assert val5.get("appVisible") is True
            assert "Dr. Alan Smith" in val5.get("h1")
            assert val5.get("activeRole") == "proctor"

            # Step 6: Test In-Charge Login Flow (via Sidebar Sign Out then In-Charge Login)
            print("\n=== STEP 6: Sidebar Logout & In-Charge Login Workflow ===")
            incharge_login = await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    document.getElementById('btnSidebarLogout').click();
                    
                    document.getElementById('tabIncharge').click();
                    document.getElementById('loginInchargeId').value = 'A2001';
                    document.getElementById('loginInchargePin').value = 'admin123';
                    document.getElementById('formInchargeLogin').dispatchEvent(new Event('submit', { cancelable: true }));
                    
                    const loginScreen = document.getElementById('loginScreen');
                    const appShell = document.getElementById('appShell');
                    const welcomeH1 = document.querySelector('#content h1') ? document.querySelector('#content h1').innerText : '';
                    const roleSelectVal = document.getElementById('roleSelect') ? document.getElementById('roleSelect').value : '';
                    const sidebarUser = document.getElementById('sidebarUserName') ? document.getElementById('sidebarUserName').innerText : '';
                    
                    return {
                        loginVisible: window.getComputedStyle(loginScreen).display !== 'none',
                        appVisible: window.getComputedStyle(appShell).display !== 'none',
                        h1: welcomeH1,
                        activeRole: roleSelectVal,
                        userName: sidebarUser
                    };
                })()
                """,
                "returnByValue": True
            })
            val6 = incharge_login.get("result", {}).get("value")
            print("In-Charge Login Result:", val6)
            assert val6.get("loginVisible") is False
            assert val6.get("appVisible") is True
            assert "Monitoring Console" in val6.get("h1")
            assert val6.get("userName") == "Arjun Sharma"
            assert val6.get("activeRole") == "admin"

            # Step 7: Check Console Errors
            print("\n=== STEP 7: Console Errors ===")
            print("Console Errors Count:", len(console_errors))
            for err in console_errors:
                print("Error Details:", err)
            assert len(console_errors) == 0, "Expected 0 console errors"

            print("\n>>> ALL LOGIN INTERFACE TESTS PASSED SUCCESSFULLY! <<<")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except Exception:
            proc.kill()

if __name__ == "__main__":
    asyncio.run(test_login_flow())
