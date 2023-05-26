![Homebrew.js](https://cdn.discordapp.com/attachments/839189307637497890/1111580038647795793/D6tXgcMAAAAAElFTkSuQmCC.png "Homebrew.js")

# 🛠 Setup
1. Install Devkitpro https://github.com/devkitPro/installer/releases
2. Setup all environments, and check that DEVKITPRO environment has been created
3. Type in your Console Project
```
npm init
npm install homebrew.js
```
4. Create a file **.js** and write
```javascript
const { App, util } = require("./homebrew.js/index")
const app = new App();
```
# 🎭 Get Started
1. Import the libs
```javascript
const { App, util } = require("./homebrew.js/index")
const app = new App();
app.Import("stdio");
app.Import("gctypes")
app.Import("gccore");
app.Import("wiiuse/wpad")
```

2. Initialize the app
```javascript
const { App, util } = require("./homebrew.js/index")
const app = new App();
app.Import("stdio");
app.Import("gctypes")
app.Import("gccore");
app.Import("wiiuse/wpad")
app.Init()
```
3. Define a function
```javascript
const { App, util } = require("./homebrew.js/index")
const app = new App();
app.Import("stdio");
app.Import("gctypes")
app.Import("gccore");
app.Import("wiiuse/wpad")
app.Init();

app.Function("name_of_function", "params", {C: 'C_CODE'})
```
4. Create your app gui
```javascript
const { App, util } = require("./homebrew.js/index")
const app = new App();
app.Import("stdio");
app.Import("gctypes")
app.Import("gccore");
app.Import("wiiuse/wpad")
app.Init();

app.Function("name_of_function", "params", {C: 'C_CODE'})

app.Main(() => {
   util.log("Hello World!")
   util.execute("C_CODE")
   util.clear();
   util.log(util.color.RED)
})
```

5. Compile
```javascript
const { App, util } = require("./homebrew.js/index")
const app = new App();
app.Import("stdio");
app.Import("gctypes")
app.Import("gccore");
app.Import("wiiuse/wpad")
app.Init();

app.Function("name_of_function", "params", {C: 'C_CODE'})

app.Main(() => {
   util.log("Hello World!")
   util.execute("C_CODE")
   util.clear();
   util.log(util.color.RED)
})

app.Compile({ "libogc_path": "yourlibogcpath" })
```

# 🚀 Compile & Launch
1. Download Dolphin: https://it.dolphin-emu.org/download/
2. Make sure you got the Makefile in the wii-homebrew-output
3. `cd wii-homebrew-output`
4. `"make"`
5. Open the .dol/.elf file with dolphin and you finished your first wii.js app!