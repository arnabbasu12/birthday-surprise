# Birthday Heart Gift ❤️

A simple, responsive birthday surprise page made with HTML, CSS and JavaScript. It has a click-to-open intro, animated pink heart particles, a custom photo area and editable birthday text.

## 1. Add your photo
1. Open the `assets` folder.
2. Put the recipient's photo inside it.
3. Rename the photo to **birthday-photo.jpg**.
4. The photo should be square or portrait for the best result.

If your photo is PNG, either convert it to JPG or edit `index.html` and change `assets/birthday-photo.jpg` to `assets/birthday-photo.png`.

## 2. Customize the message
Open `index.html` and change these lines:
- `শুভ জন্মদিন!` — the main birthday heading
- The sentence inside the `wish` paragraph — your personal wish
- `With lots of love ♥` — your name or signature

## 3. Test on your computer
Double-click `index.html` to open it in a browser. The page works without a server.

## 4. Publish with GitHub Pages
1. Create a new public GitHub repository, for example `birthday-surprise`.
2. Upload **index.html**, **style.css**, **script.js**, and the **assets** folder (including your photo).
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**, then click **Save**.
6. Wait a little. GitHub will show your website link, usually:
   `https://YOUR-USERNAME.github.io/birthday-surprise/`

Send that link to the person. Their browser will load the photo from the repository too.

## Important
Do not use a local computer path such as `C:\\Users\\...` for the image. The image must be uploaded inside the repository's `assets` folder so everyone opening the published link can see it.
