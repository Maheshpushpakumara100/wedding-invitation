# Dhananjani & Mahesh — Digital Wedding Invitation

A floral‑elegant, single‑page digital wedding card with:

- Personalised guest greetings (each guest gets their own link)
- Live countdown to the wedding
- Wedding details, Poruwa ceremony time and venue map link
- "Add to Calendar" button (downloads an `.ics` file)
- WhatsApp RSVP form (opens a ready‑made message)
- A small **Guest Link Manager** admin page to add guests, generate links and export the guest file
- A full-screen intro video that plays after the guest taps **Open Invitation**
- 100% free hosting on **GitHub Pages**

---

## 1. Files in this project

```
index.html            → the invitation card (guests see this)
admin.html            → the private Guest Link Manager
assets/
  style.css           → card styling (floral theme)
  app.js              → countdown, personalisation, RSVP, calendar
  admin.css           → admin page styling
  admin.js            → admin logic
data/
  guests.json         → the published guest list
Videos/
  invitation-intro.mp4 → intro video played after "Open Invitation"
Invitation card/      → your original photo + link.txt (not used by the site)
```

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

**Admin passcode:** `D&M2026` (change it in `assets/admin.js`).

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

### Step 4 — Connect the admin page to your live site
1. Open `https://USERNAME.github.io/wedding/admin.html`.
2. Enter the passcode `D&M2026`.
3. In **Site link**, paste `https://USERNAME.github.io/wedding/`
   (it must end with a slash) and click **Save**.
4. Add your guests. The generated links will now use your real address.

---

## 4. Creating personalised guest links

1. Go to `https://USERNAME.github.io/wedding/admin.html`.
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
Changes in the admin page are saved **in your browser only** until you publish them:

1. Click **Download guests.json**.
2. In your GitHub repository, open the `data` folder → `guests.json` → pencil **Edit**.
3. Delete the old content, paste the downloaded content, and **Commit changes**.
   (Or use **Add file → Upload files** and upload the new `guests.json`, replacing the old one.)
4. Wait ~1 minute. The live site now greets each guest by name.

### Test a guest link
Open `https://USERNAME.github.io/wedding/?g=CODE` — you should see “Dear … ,”
You can also test without a code using `?to=Mr.%20%26%20Mrs.%20Silva`.

> The sample guest `Mr. & Mrs. Silva` is included only for testing.
> Delete it in the admin page before you go live.

---

## 5. WhatsApp RSVP

- The **Send reply on WhatsApp** button opens a chat with **Mahesh (071 79 79 436)**
  and pre‑fills the guest’s name, attendance choice and number of guests.
- The two contact cards let guests call either of you.
- To change the primary RSVP number, edit this line in `assets/app.js`:

  ```js
  var RSVP_WHATSAPP = "94717979436"; // Mahesh — primary RSVP number
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
| Admin passcode | `ADMIN_PASSCODE` in `assets/admin.js` |
| Colours / fonts | `:root` variables at the top of `assets/style.css` |
| Google Maps location | Search `Tranquil Hotel` links in `index.html` |
| Guest list | Admin page → Download → upload `data/guests.json` |
| Intro video | Replace `Videos/invitation-intro.mp4` (H.264 MP4; portrait or landscape) |

---

## 7. Making changes after guests have the link

Everything is plain HTML/CSS/JS. You can edit files directly on GitHub
(pencil icon → edit → **Commit changes**) or re‑upload them. The site updates
automatically in about a minute, and previously shared links keep working.

---

## 8. Important notes

- **Privacy:** GitHub Pages is public. `data/guests.json` is technically readable
  by anyone who knows the address. Only store display names — never phone numbers
  or addresses for guests. (The phone field is optional and only used for sharing;
  leave it blank if you prefer.)
- **Admin passcode is not real security.** It is a convenience lock in the browser.
  Anyone who guesses the URL can open the admin page; the passcode only hides the
  interface. Since the guest list itself is public, this is fine for a wedding —
  just don't put private data in `guests.json`.
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

GitHub Pages is recommended here because the admin → download → upload workflow
matches how the guest list is published.
