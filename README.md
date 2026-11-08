# Dhananjani & Mahesh — Digital Wedding Invitation

A floral‑elegant, single‑page digital wedding card with:

- Personalised guest greetings (each guest gets their own link)
- Live countdown to the wedding
- Wedding details, Poruwa ceremony time and venue map link
- "Add to Calendar" button (downloads an `.ics` file)
- WhatsApp RSVP form (opens a ready‑made message)
- A **Guest Link Manager** admin page (username + password) backed by **Google Sheets + Google Apps Script**
- Guest names are read live from the Sheet, so new guests work instantly
- A full-screen intro video that plays after the guest taps **Open Invitation**
- 100% free hosting on **GitHub Pages**

---

## 1. Files in this project

```
index.html            → the invitation card (guests see this)
admin.html            → groom's private Guest Link Manager
admin-dhananjani.html → bride's private Guest Link Manager (separate list + login)
assets/
  config.js           → API URL + site address (edit this)
  style.css           → card styling (floral theme)
  app.js              → countdown, personalisation, RSVP, calendar
  admin.css           → admin page styling
  admin.js            → admin logic (talks to Apps Script)
apps-script/
  Code.gs              → Google Apps Script backend (paste into script.google.com)
  appsscript.json      → manifest for the Apps Script project
data/
  guests.json         → offline fallback guest list
Videos/
  invitation-intro.mp4 → intro video played after "Open Invitation"
Invitation card/      → your original photo + link.txt (not used by the site)
```

> The live guest list lives in a **Google Sheet**. `data/guests.json` is only
> used if the Apps Script backend is unreachable or not configured yet.

---

## 2. Preview it on your computer

In the project folder, run a tiny local server (needed so the guest list loads):

```powershell
python -m http.server 8000
```

Then open:

- Invitation: <http://localhost:8000/>
- With a guest: <http://localhost:8000/?g=silva-family>
- Admin: <http://localhost:8000/admin.html>

> Opening `index.html` by double‑clicking also works, but the personalised guest
> list may not load because browsers block local file reads. Use the server above
> for accurate previews.

> Tip: add `?skip=1` to any link (e.g. `http://localhost:8000/?skip=1`) to skip the
> intro video and go straight to the invitation.

**Admin logins:** username + password configured in the Apps Script backend.
- Groom: <http://localhost:8000/admin.html> (default first-run `admin` / `D&M2026`)
- Bride: <http://localhost:8000/admin-dhananjani.html> (default first-run `dhananjani` / `Bride2026!`)

Complete the backend setup below first.

---

## 2b. Connect the Google Sheets backend (one-time setup)

The admin login, guest list and guest lookup all run through a free
**Google Apps Script** web app. You only do this once.

### Step 1 — Create the Apps Script project
1. Open <https://script.google.com> and sign in with the Google account that
   should own the guest list.
2. Click **New project**.
3. Open `apps-script/Code.gs` from this folder, copy everything, and paste it
   over the default code in the editor.
4. Near the top, change these lines to your own credentials:
   ```js
   // Groom-side admin (admin.html)
   var DEFAULT_ADMIN_USERNAME = 'admin';
   var DEFAULT_ADMIN_PASSWORD = 'D&M2026';

   // Bride-side admin (admin-dhananjani.html)
   var DEFAULT_BRIDE_ADMIN_USERNAME = 'dhananjani';
   var DEFAULT_BRIDE_ADMIN_PASSWORD = 'Bride2026!';
   ```
5. Click **Save** (the disk icon).

### Step 2 — Run the setup function
1. In the function dropdown (top toolbar), choose **setup**.
2. Click **Run**. Approve the Google permissions when prompted.
3. A new Google Sheet called **D&M Wedding Guest List** is created with three
   tabs: `Guests` (groom's list), `BrideGuests` (bride's list) and `Settings`.
   Its ID is saved automatically.
   (Check **View → Logs** to see the Sheet URL and both admin usernames.)

### Step 3 — Deploy as a Web App
1. Click **Deploy → New deployment**.
2. Select type **Web app**.
3. Set:
   - **Description:** Wedding API
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**, then copy the **Web app URL** (ends in `/exec`).

### Step 4 — Point the site at the API
1. Open `assets/config.js`.
2. Paste the `/exec` URL into `API_URL`:
   ```js
   window.DM_CONFIG = {
     API_URL: "https://script.google.com/macros/s/AKfy.../exec",
     SITE_BASE: "https://username.github.io/wedding/"
   };
   ```
3. Commit/upload the change.

### Step 5 — Sign in
1. Open `admin.html` (locally or on your live site) for the groom's list.
2. Open `admin-dhananjani.html` for the bride's list — a separate login and a
   separate `BrideGuests` sheet tab, so each side manages only their own guests.
3. Sign in with the username/password from Step 1.
4. Add guests — they save straight to the Google Sheet.
5. Use **Account → Change password** after the first login (changes only that
   side's password). From the editor, run `resetAdminCredentials` for the groom
   or `resetBrideCredentials` for the bride.

> Personal links work for guests from either list: the public API checks both
> the `Guests` and `BrideGuests` tabs when it greets a guest.

### Notes
- **Already deployed an earlier version?** Paste the updated `Code.gs`, run
  **setup** again (this adds the `BrideGuests` tab and the bride login without
  touching existing guests), then deploy a **new version**.
- **Test the API:** open `YOUR_URL/exec?action=health` in a browser. You should
  see JSON like `{"ok":true,"service":"dm-wedding-api",...}`.
- **After editing the Apps Script code**, create a new version:
  **Deploy → Manage deployments → Edit → Version: New version → Deploy**.
  The URL stays the same.
- **Privacy:** the Sheet is private to your Google account. The public API only
  returns the display name for an exact guest code; it never exposes phones or
  the full list.
- **If admin shows "Failed to fetch":** confirm the deployment access is
  **Anyone**, and that `API_URL` ends in `/exec` (not `/dev`).

---

## 3. Free hosting on GitHub Pages (step by step)

You need a free GitHub account: <https://github.com/signup>

### Step 1 — Create a repository
1. Sign in to GitHub.
2. Click **+** (top right) → **New repository**.
3. Repository name: `wedding` (or anything you like).
4. Set **Public** (required for free GitHub Pages).
5. Click **Create repository**.

### Step 2 — Upload the site
1. On the repository page, click **Add file → Upload files**.
2. Drag these into the upload box: `index.html`, `admin.html`, the `assets` folder, the `data` folder, and the `Videos` folder.
   - Keep the same folder structure. Dragging folders onto the upload page keeps them.
   - `Videos/invitation-intro.mp4` must be uploaded too, or the intro video will be skipped.
3. Click **Commit changes**.

> Prefer the command line? From this folder:
> ```powershell
> git init
> git add .
> git commit -m "Wedding invitation"
> git branch -M main
> git remote add origin https://github.com/USERNAME/wedding.git
> git push -u origin main
> ```

### Step 3 — Turn on GitHub Pages
1. Open the repository → **Settings** → **Pages**.
2. Under **Build and deployment**:
   - **Source:** Deploy from a branch
   - **Branch:** `main`  ·  **Folder:** `/ (root)`
3. Click **Save**.
4. Wait about 1 minute. Your site will be live at:

   ```
   https://USERNAME.github.io/wedding/
   ```

### Step 4 — Connect the admin pages to your live site
1. Open `https://USERNAME.github.io/wedding/admin.html`.
2. Sign in with the groom username/password you set in the Apps Script backend.
3. In **Site link**, paste `https://USERNAME.github.io/wedding/`
   (it must end with a slash) and click **Save**.
4. Add your guests. The generated links will now use your real address.
5. For the bride's list, open
   `https://USERNAME.github.io/wedding/admin-dhananjani.html` and sign in with
   the bride credentials. Both pages share the same **Site link**.

---

## 4. Creating personalised guest links

1. Go to `https://USERNAME.github.io/wedding/admin.html` (groom) or
   `https://USERNAME.github.io/wedding/admin-dhananjani.html` (bride).
2. Fill in the guest:
   - **Salutation** (Mr., Mrs., Mr. & Mrs., Family of, etc.)
   - **Name**
   - **Display name** — this is exactly what appears as “Dear … ,” on the card
   - **Phone** (optional) — lets you send the link straight to them on WhatsApp
   - **Guest link code** — auto‑generated with a random suffix (you can edit it)
3. Click **Add guest**.
4. Use the row buttons:
   - **Copy** – copies the guest’s personal link
   - **WhatsApp** – opens WhatsApp with the link and a ready message
   - **Edit / Delete** – change or remove the guest

### Publish the guest list
Nothing to publish — changes save directly to the Google Sheet and the live
invitation reads them immediately.

The **Download backup JSON** button is optional: it gives you a copy of the
list and can replace `data/guests.json` as an offline fallback. If you update
that file, upload it to the `data` folder on GitHub as before.

### Test a guest link
Open `https://USERNAME.github.io/wedding/?g=CODE` — you should see “Dear … ,”
You can also test without a code using `?to=Mr.%20%26%20Mrs.%20Silva`.

> The sample guest `Mr. & Mrs. Silva` is included only for testing.
> Delete it in the admin page before you go live.

---

## 5. WhatsApp RSVP

- Two reply buttons open WhatsApp with the guest’s name and attendance choice
  pre‑filled: one to **Dhananjani (071 55 34 712)**, one to **Mahesh (071 79 79 436)**.
- To change the numbers, edit these lines in `assets/app.js`:

  ```js
  var RSVP_WHATSAPP_DHANANJANI = "94715534712"; // Dhananjani
  var RSVP_WHATSAPP = "94717979436";            // Mahesh
  ```

  Use the international format without `+` (e.g. `94717979436`).

- Update the contact cards and phone links in `index.html` to change the numbers shown.

---

## 6. Easy customisations

| What | Where |
|------|-------|
| Couple names, date, venue, ceremony text | `index.html` |
| Countdown date/time | `WEDDING_ISO` in `assets/app.js` (`2026-12-07T08:30:00+05:30`) |
| Primary WhatsApp RSVP number | `RSVP_WHATSAPP` in `assets/app.js` |
| Groom admin username / password | Apps Script backend (`resetAdminCredentials`) or **Account** panel in `admin.html` |
| Bride admin username / password | Apps Script backend (`resetBrideCredentials`) or **Account** panel in `admin-dhananjani.html` |
| API endpoint | `API_URL` in `assets/config.js` |
| Colours / fonts | `:root` variables at the top of `assets/style.css` |
| Google Maps location | Search `Tranquil Hotel` links in `index.html` |
| Guest lists | Admin pages (groom → `Guests` tab, bride → `BrideGuests` tab) |
| Intro video | Replace `Videos/invitation-intro.mp4` (H.264 MP4; portrait or landscape) |

---

## 7. Making changes after guests have the link

The website is plain HTML/CSS/JS. You can edit files directly on GitHub
(pencil icon → edit → **Commit changes**) or re‑upload them. The site updates
automatically in about a minute, and previously shared links keep working.

Backend changes (`apps-script/Code.gs`) are different: paste the updated code in
the Apps Script editor, then **Deploy → Manage deployments → Edit → New version**.
The `/exec` URL stays the same, so `assets/config.js` does not need editing.

---

## 8. Important notes

- **Privacy:** The Google Sheet is private to your Google account. The public API
  only returns a guest's display name when the exact guest code is supplied — it
  never exposes the full list or phone numbers. `data/guests.json` (optional
  fallback) is publicly readable on GitHub Pages, so only put display names there.
- **Admin login** is validated on the server by Apps Script. Passwords are stored
  as salted SHA-256 hashes in Script Properties, never in the browser. Sessions
  expire after 8 hours.
- **Personalised links** use random suffixes by default, so they are hard to guess.
- **Generic link:** the plain `https://USERNAME.github.io/wedding/` shows “Dear Guest,”
  — useful for a QR code or social media.

---

## 9. Other free hosts (optional)

You are not locked in. The same files work on:

- **Netlify** — <https://netlify.com> → drag the project folder onto the dashboard.
  Free `your-name.netlify.app` address, automatic HTTPS.
- **Cloudflare Pages** — <https://pages.cloudflare.com> → connect the GitHub repo.
  Free `your-name.pages.dev` address.

The guest list lives in Google Sheets, so the host only serves static files.
Any of the hosts above works with the same `assets/config.js` API URL.
