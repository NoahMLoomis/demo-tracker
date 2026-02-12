"""One-shot Strava OAuth helper.

Opens the browser, catches the redirect on a local server,
and exchanges the code for tokens immediately.

Usage:  python scripts/strava_auth.py
"""

import http.server
import json
import os
import urllib.parse
import urllib.request
import webbrowser

from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.environ["STRAVA_CLIENT_ID"]
CLIENT_SECRET = os.environ["STRAVA_CLIENT_SECRET"]

PORT = 5678
REDIRECT_URI = f"http://localhost:{PORT}"
AUTHORIZE_URL = (
    f"https://www.strava.com/oauth/authorize"
    f"?client_id={CLIENT_ID}"
    f"&response_type=code"
    f"&redirect_uri={REDIRECT_URI}"
    f"&scope=activity:read_all"
    f"&approval_prompt=force"
)


def exchange_code(code):
    data = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
    }).encode("utf-8")
    req = urllib.request.Request("https://www.strava.com/oauth/token", data=data, method="POST")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode("utf-8"))


class Handler(http.server.BaseHTTPRequestHandler):
    token_response = None

    def do_GET(self):
        qs = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(qs)
        code = params.get("code", [None])[0]

        if not code:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"No code received. Try again.")
            return

        try:
            Handler.token_response = exchange_code(code)
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<h2>Success! You can close this tab.</h2>")
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"Token exchange failed: {e}".encode())

    def log_message(self, format, *args):
        pass  # silence request logs


def main():
    print(f"Opening browser for Strava authorization...")
    print(f"(If it doesn't open, visit: {AUTHORIZE_URL})\n")
    webbrowser.open(AUTHORIZE_URL)

    server = http.server.HTTPServer(("localhost", PORT), Handler)
    server.handle_request()  # handle exactly one request, then stop

    tok = Handler.token_response
    if not tok:
        print("No token received.")
        return

    if "errors" in tok:
        print(f"Strava error: {tok}")
        return

    print(f"Athlete:       {tok.get('athlete', {}).get('firstname', '?')} "
          f"{tok.get('athlete', {}).get('lastname', '')}")
    print(f"Scope:         {tok.get('scope', 'N/A')}")
    print(f"Refresh token: {tok['refresh_token']}")
    print()

    # Save to .env
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    env_path = os.path.normpath(env_path)
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            lines = f.readlines()
        with open(env_path, "w") as f:
            for line in lines:
                if line.startswith("STRAVA_REFRESH_TOKEN="):
                    f.write(f"STRAVA_REFRESH_TOKEN={tok['refresh_token']}\n")
                else:
                    f.write(line)
        print(f"Updated STRAVA_REFRESH_TOKEN in {env_path}")
    else:
        print(f"No .env found at {env_path} — update STRAVA_REFRESH_TOKEN manually.")


if __name__ == "__main__":
    main()
