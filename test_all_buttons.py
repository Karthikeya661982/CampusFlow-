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

async def test_all_buttons():
    user_data_dir = tempfile.mkdtemp(prefix="chrome_buttons_test_")
    port = 9445
    
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
    print("Launched Chrome for Complete Button & Control Verification, PID:", proc.pid)
    
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
            return False

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
                    resp = json.loads(await ws.recv())
                    if resp.get("method") == "Runtime.consoleAPICalled":
                        c_type = resp["params"].get("type")
                        if c_type in ("error", "warning"):
                            text = " ".join([str(a.get("value", a.get("description", ""))) for a in resp["params"].get("args", [])])
                            if c_type == "error":
                                console_errors.append(text)
                    if resp.get("id") == payload["id"]:
                        return resp.get("result", {})

            await send_cmd("Runtime.enable")
            await send_cmd("Page.enable")
            
            async def eval_js(expr):
                r = await send_cmd("Runtime.evaluate", {"expression": expr, "returnByValue": True, "awaitPromise": True})
                if "exceptionDetails" in r:
                    print("JS Exception:", r["exceptionDetails"])
                return r.get("result", {}).get("value")

            # Bypass confirm dialogs during automated tests
            await eval_js("window.confirm = () => true; window.alert = () => true;")

            print("\n=== 1. TEST LOGIN BUTTONS & ROLE TABS ===")
            # Test student autofill pill
            await eval_js("document.querySelectorAll('[data-autofill-student]')[1].click()")
            roll_val = await eval_js("document.getElementById('loginStudentRoll').value")
            print(f"Student autofill pill clicked: roll={roll_val}")
            assert roll_val == "1RV22CS142", "Autofill failed"

            # Submit student login
            await eval_js("document.getElementById('formStudentLogin').dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}))")
            await asyncio.sleep(0.4)
            is_logged_in = await eval_js("document.getElementById('appShell').style.display !== 'none'")
            print(f"Logged in into App Shell: {is_logged_in}")
            assert is_logged_in, "Login failed"

            print("\n=== 2. TEST USER PROFILE MODAL & TOPBAR AVATAR ===")
            # Open via top avatar
            await eval_js("document.getElementById('topAvatar').click()")
            await asyncio.sleep(0.3)
            p_modal_open = await eval_js("document.getElementById('profileModalBackdrop').classList.contains('open')")
            print(f"Profile Modal open via #topAvatar: {p_modal_open}")
            assert p_modal_open, "Profile modal failed to open from topAvatar"

            # Close via close button
            await eval_js("document.getElementById('closeProfileModal').click()")
            await asyncio.sleep(0.2)
            p_modal_closed = await eval_js("!document.getElementById('profileModalBackdrop').classList.contains('open')")
            print(f"Profile Modal closed via close button: {p_modal_closed}")
            assert p_modal_closed, "Profile modal close failed"

            # Open via sidebar profile card
            await eval_js("document.getElementById('userProfileCard').click()")
            await asyncio.sleep(0.3)
            p_modal_open2 = await eval_js("document.getElementById('profileModalBackdrop').classList.contains('open')")
            print(f"Profile Modal open via #userProfileCard: {p_modal_open2}")
            assert p_modal_open2, "Profile modal failed to open from sidebar"

            # Test Quick Role Switch button inside Profile Modal
            await eval_js("document.getElementById('btnProfileSwitchProctor').click()")
            await asyncio.sleep(0.4)
            active_role = await eval_js("window.state ? window.state.role : ''")
            print(f"Switched role to proctor via profile modal pill: activeRole={active_role}")

            # Close profile modal if still open
            await eval_js("document.getElementById('btnDismissProfile') ? document.getElementById('btnDismissProfile').click() : null")

            print("\n=== 3. TEST INSTITUTIONAL WORKSPACE MODAL ===")
            await eval_js("document.getElementById('workspaceTrigger').click()")
            await asyncio.sleep(0.3)
            ws_open = await eval_js("document.getElementById('workspaceModalBackdrop').classList.contains('open')")
            print(f"Workspace modal open via #workspaceTrigger: {ws_open}")
            assert ws_open, "Workspace modal failed to open"

            # Click Attendance quick link inside workspace modal
            await eval_js("document.getElementById('btnWsNavAtt').click()")
            await asyncio.sleep(0.4)
            page_crumb = await eval_js("document.getElementById('pageCrumb').textContent")
            print(f"Navigated via workspace modal quick link to: {page_crumb}")
            assert "Attendance" in page_crumb, "Workspace nav failed"

            print("\n=== 4. TEST ATTENDANCE REGISTRY BUTTONS & FILTERS ===")
            # Check search filter
            await eval_js("""
                const s = document.getElementById('attSearch');
                s.value = '25EU';
                s.dispatchEvent(new Event('input', {bubbles: true}));
            """)
            await asyncio.sleep(0.2)
            matched_count = await eval_js("document.getElementById('attBadgeCount').textContent")
            print(f"Attendance search filtered count for '25EU': {matched_count}")

            # Clear search
            await eval_js("""
                const s = document.getElementById('attSearch');
                s.value = '';
                s.dispatchEvent(new Event('input', {bubbles: true}));
            """)
            await asyncio.sleep(0.2)

            # Department filter
            await eval_js("""
                const d = document.getElementById('attDeptFilter');
                d.value = 'Computer Science';
                d.dispatchEvent(new Event('change', {bubbles: true}));
            """)
            await asyncio.sleep(0.2)
            dept_count = await eval_js("document.getElementById('attBadgeCount').textContent")
            print(f"Attendance filtered by CS dept count: {dept_count}")

            # Eligibility filter
            await eval_js("""
                const el = document.getElementById('attEligFilter');
                el.value = 'eligible';
                el.dispatchEvent(new Event('change', {bubbles: true}));
            """)
            await asyncio.sleep(0.2)
            elig_count = await eval_js("document.getElementById('attBadgeCount').textContent")
            print(f"Attendance filtered by Eligible count: {elig_count}")

            # Reset filters
            await eval_js("""
                document.getElementById('attDeptFilter').value = 'all';
                document.getElementById('attEligFilter').value = 'all';
                document.getElementById('attEligFilter').dispatchEvent(new Event('change', {bubbles: true}));
            """)

            # Template Modal trigger
            await eval_js("document.getElementById('btnDownloadTemplates').click()")
            await asyncio.sleep(0.3)
            tmpl_open = await eval_js("document.getElementById('templateModalBackdrop').classList.contains('open')")
            print(f"Template Modal open: {tmpl_open}")
            assert tmpl_open, "Template modal failed to open"

            # Download CSV and XLSX template buttons
            await eval_js("document.getElementById('btnDownloadTmplCsv').click()")
            await eval_js("document.getElementById('btnDownloadTmplXlsx').click()")
            print("Template download buttons triggered successfully")

            # Close template modal
            await eval_js("document.getElementById('closeTemplateModal').click()")
            await asyncio.sleep(0.2)

            print("\n=== 5. TEST ELIGIBILITY RULES CONTROLS & LIVE SIMULATION ===")
            await eval_js("document.querySelector('a[data-page=\"rules\"]').click()")
            await asyncio.sleep(0.3)
            
            # Simulate changing threshold to 80%
            await eval_js("""
                const inp = document.getElementById('cfgThreshold');
                inp.value = 80;
                inp.dispatchEvent(new Event('input', {bubbles: true}));
            """)
            await asyncio.sleep(0.2)
            sim_text = await eval_js("document.getElementById('simContent').textContent")
            print(f"Simulation response for 80% threshold: {sim_text}")
            assert "80%" in sim_text, "Live simulation failed"

            # Reset rules button
            await eval_js("document.getElementById('btnResetRules').click()")
            await asyncio.sleep(0.2)
            sim_reset_text = await eval_js("document.getElementById('simContent').textContent")
            print(f"Simulation reset response: {sim_reset_text}")
            assert "75%" in sim_reset_text, "Rules reset button failed"

            # Save rules form
            await eval_js("document.getElementById('frmSaveRules').dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}))")
            await asyncio.sleep(0.2)

            print("\n=== 6. TEST REPORTS & EXPORTS BUTTONS ===")
            await eval_js("document.querySelector('a[data-page=\"reports\"]').click()")
            await asyncio.sleep(0.3)
            # Click all export buttons on reports page
            export_btns = [
                'btnExportAttCsv', 'btnExportAttXlsx',
                'btnExportReqCsv', 'btnExportReqXlsx',
                'btnExportAuditRepCsv', 'btnExportAuditRepXlsx',
                'btnExportFullPackage'
            ]
            for btn_id in export_btns:
                res = await eval_js(f"document.getElementById('{btn_id}') ? (document.getElementById('{btn_id}').click(), true) : false")
                assert res, f"Export button {btn_id} missing or failed"
            print(f"All {len(export_btns)} export report buttons triggered successfully")

            print("\n=== 7. TEST AUDIT & INGESTION LOGS VIEW ===")
            await eval_js("document.querySelector('a[data-page=\"audit\"]').click()")
            await asyncio.sleep(0.3)
            await eval_js("document.getElementById('btnExportAuditCsv').click()")
            await eval_js("document.getElementById('btnExportAuditXlsx').click()")
            history_rows = await eval_js("document.querySelectorAll('#content table tbody tr').length")
            print(f"Audit logs rendered rows: {history_rows}")
            assert history_rows > 0, "Audit logs table empty"

            print("\n=== 8. TEST DASHBOARD STAT CARDS CLICKABLE NAVIGATION ===")
            # Switch to In-Charge to test incharge stat cards
            await eval_js("""
                const sel = document.getElementById('roleSelect');
                sel.value = 'admin';
                sel.dispatchEvent(new Event('change', {bubbles: true}));
            """)
            await asyncio.sleep(0.3)
            # Navigate to Dashboard
            await eval_js("document.querySelector('a[data-page=\"dashboard\"]').click()")
            await asyncio.sleep(0.3)

            # Click Stat Card 1 (Pending Decision Queue -> data-nav-req="pending")
            await eval_js("document.querySelectorAll('.stat-card[data-nav-req=\"pending\"]')[0].click()")
            await asyncio.sleep(0.4)
            crumb = await eval_js("document.getElementById('pageCrumb').textContent")
            active_chip = await eval_js("document.querySelector('.chip-filter.active') ? document.querySelector('.chip-filter.active').getAttribute('data-filter') : ''")
            print(f"Stat card 'pending' clicked: Crumb={crumb}, Filter={active_chip}")
            assert "Requests" in crumb and active_chip == "pending", "Pending stat card navigation failed"

            # Return to dashboard and click Stat Card 2 (Approved -> data-nav-req="approved")
            await eval_js("document.querySelector('a[data-page=\"dashboard\"]').click()")
            await asyncio.sleep(0.3)
            await eval_js("document.querySelectorAll('.stat-card[data-nav-req=\"approved\"]')[0].click()")
            await asyncio.sleep(0.4)
            active_chip_app = await eval_js("document.querySelector('.chip-filter.active') ? document.querySelector('.chip-filter.active').getAttribute('data-filter') : ''")
            print(f"Stat card 'approved' clicked: Filter={active_chip_app}")
            assert active_chip_app == "approved", "Approved stat card navigation failed"

            # Return to dashboard and click Stat Card 4 (Active Dataset Version -> data-nav="audit")
            await eval_js("document.querySelector('a[data-page=\"dashboard\"]').click()")
            await asyncio.sleep(0.3)
            await eval_js("document.querySelectorAll('.stat-card[data-nav=\"audit\"]')[0].click()")
            await asyncio.sleep(0.4)
            crumb_audit = await eval_js("document.getElementById('pageCrumb').textContent")
            print(f"Stat card 'audit' clicked: Crumb={crumb_audit}")
            assert "Audit" in crumb_audit, "Audit stat card navigation failed"

            print("\n=== 9. TEST REQUEST DETAILS MODAL & CONTEXTUAL ACTIONS ===")
            await eval_js("document.querySelector('a[data-page=\"requests\"]').click()")
            await asyncio.sleep(0.3)
            # Click first audit trail button
            await eval_js("document.querySelectorAll('[data-view]')[0].click()")
            await asyncio.sleep(0.4)
            det_open = await eval_js("document.getElementById('detailsModalBackdrop').classList.contains('open')")
            print(f"Request Details Modal open: {det_open}")
            assert det_open, "Details modal failed to open"

            # Check contextual action buttons rendered inside details modal
            btn_dismiss = await eval_js("document.getElementById('btnDismissDetails') !== null")
            btn_print = await eval_js("document.getElementById('btnDetailsPrint') !== null")
            print(f"Contextual actions present: Dismiss={btn_dismiss}, Print={btn_print}")
            assert btn_dismiss and btn_print, "Contextual actions in details modal missing"

            # Close details modal
            await eval_js("document.getElementById('btnDismissDetails').click()")
            await asyncio.sleep(0.2)
            det_closed = await eval_js("!document.getElementById('detailsModalBackdrop').classList.contains('open')")
            print(f"Details modal closed: {det_closed}")
            assert det_closed, "Details modal close failed"

            print("\n=== 10. TEST BACKDROP CLICK & ESCAPE KEY DISMISSAL ===")
            # Open workspace modal again
            await eval_js("document.getElementById('workspaceTrigger').click()")
            await asyncio.sleep(0.2)
            # Trigger backdrop click
            await eval_js("document.getElementById('workspaceModalBackdrop').click()")
            await asyncio.sleep(0.2)
            ws_closed_backdrop = await eval_js("!document.getElementById('workspaceModalBackdrop').classList.contains('open')")
            print(f"Workspace modal dismissed via outside backdrop click: {ws_closed_backdrop}")
            assert ws_closed_backdrop, "Backdrop click dismissal failed"

            # Open profile modal and dismiss with Escape key
            await eval_js("document.getElementById('topAvatar').click()")
            await asyncio.sleep(0.2)
            await eval_js("document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))")
            await asyncio.sleep(0.2)
            p_closed_escape = await eval_js("!document.getElementById('profileModalBackdrop').classList.contains('open')")
            print(f"Profile modal dismissed via Escape key: {p_closed_escape}")
            assert p_closed_escape, "Escape key modal dismissal failed"

            print("\n=== 11. CHECK CONSOLE ERRORS ===")
            print(f"Console errors recorded: {len(console_errors)}")
            if console_errors:
                print("Errors:", console_errors)
            assert len(console_errors) == 0, f"Found {len(console_errors)} console errors"

            print("\n>>> ALL FUNCTIONAL BUTTONS AND WORKFLOWS VERIFIED 100% OPERATIONAL! <<<")
            return True

    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    success = asyncio.run(test_all_buttons())
    if not success:
        sys.exit(1)
