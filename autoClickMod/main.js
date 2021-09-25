const AutoClickMod = {
	labelList: {
		cookie: "大クッキー自動クリック",
		cookieCpS: "大クッキークリック秒速",
		shimmers: "ゴールデンクッキー自動クリック",
		wrath: "赤クッキー自動クリック",
	},
	config: {
		cookie: false,
		cookieCpS: 8,
		shimmers: false,
		wrath: false,
	},
	init: function () {
		setTimeout(function () {
			AutoClickMod.modInit();
		}, 1000);
	},
	modInit: function () {
		AutoClickMod.appendConfig();
		AutoClickMod.clickCookie();
		AutoClickMod.clickShimmers();
	},
	appendConfig: function () {
		const originFunc = Game.UpdateMenu;
		Game.UpdateMenu = function () {
			originFunc();
			if (Game.onMenu == 'prefs') {
				const div = document.createElement("div");
				div.className = 'framed'
				div.style = 'margin: 4px 48px;'
				div.innerHTML = `
				<div class="block" style="padding:0px;margin:8px 4px;">
					<div class="subsection" style="padding:0px;">
						<div class="title">auto click mod</div>
						<div class="listing">`;
				for (const key in AutoClickMod.config) {
					if (["cookie", "shimmers", "wrath"].includes(key)) {
						div.innerHTML += `
						<a id="auto-click-mod-${key}" class="smallFancyButton option ${(AutoClickMod.config[key] ? '' : 'off')}"
						onclick="AutoClickMod.toggleConfig('${key}');">${AutoClickMod.labelList[key]}${AutoClickMod.config[key] ? `ON` : `OFF`}</a>
						<br>`;
					}
					if (key == "cookieCpS") {
						div.innerHTML += `
						<a id="auto-click-mod-${key}-button" class="smallFancyButton option">${AutoClickMod.labelList[key]}</a>
						<input type="number" id="auto-click-mod-${key}" style="width:3em;"
						min="1" max="200" step="1" value="${AutoClickMod.config[key] || 1}"
						onchange="AutoClickMod.changeCookieCps();"/>
						<br>`;
					}
				}
				div.innerHTML += `
						</div>
					</div>
				</div>`;
				const menu = document.getElementById("menu");
				menu.insertBefore(div, menu.lastChild);
			}
		};
	},
	toggleConfig: function (key) {
		AutoClickMod.config[key] = !AutoClickMod.config[key];
		const button = document.getElementById(`auto-click-mod-${key}`);
		button.className = `smallFancyButton option ${AutoClickMod.config[key] ? '' : ' off'}`;
		button.innerHTML = `${AutoClickMod.labelList[key]}${AutoClickMod.config[key] ? `ON` : `OFF`}`;

	},
	changeCookieCps: function () {
		const key = "cookieCpS";
		const input = document.getElementById(`auto-click-mod-${key}`);
		AutoClickMod.config[key] = input.value;
	},
	clickCookie: function () {
		if (AutoClickMod.config.cookie) {
			Game.ClickCookie();
		}
		setTimeout(function () {
			AutoClickMod.clickCookie();
		}, 1000 / AutoClickMod.config.cookieCpS);
	},
	clickShimmers: function () {
		if (AutoClickMod.config.shimmers) {
			for (const i in Game.shimmers) {
				const c = Game.shimmers[i];
				if (!c.wrath || AutoClickMod.config.wrath) {
					c.pop();
				}
			}
		}
		setTimeout(function () {
			AutoClickMod.clickShimmers();
		}, 500);
	},
	save: function () {
		//use this to store persistent data associated with your mod
		const s = {
			config: this.config
		}
		return JSON.stringify(s)
	},
	load: function (str) {
		//do stuff with the string data you saved previously
		const l = JSON.parse(str);
		if (l.config) {
			for (const key in l.config) {
				this.config[key] = l.config[key];
			}
		}
	},
}
Game.registerMod("auto click mod", AutoClickMod);
