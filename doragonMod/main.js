const DragonMod = {
	labelList: {
		auto: "自動育成",
	},
	config: {
		auto: true,
	},
	init: function () {
		setTimeout(function () {
			DragonMod.modInit();
		}, 1000);
	},
	modInit: function () {
		DragonMod.appendConfig();
		DragonMod.autoUpgrade();
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
						<div class="title">dragon mod</div>
						<div class="listing">`;
				for (const key in DragonMod.config) {
					if (["auto",].includes(key)) {
						div.innerHTML += `
						<a id="dragon-mod-${key}" class="smallFancyButton option ${(DragonMod.config[key] ? '' : 'off')}"
						onclick="DragonMod.toggleConfig('${key}');">${DragonMod.labelList[key]}${DragonMod.config[key] ? `ON` : `OFF`}</a>
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
		DragonMod.config[key] = !DragonMod.config[key];
		const button = document.getElementById(`dragon-mod-${key}`);
		button.className = `smallFancyButton option ${DragonMod.config[key] ? '' : ' off'}`;
		button.innerHTML = `${DragonMod.labelList[key]}${DragonMod.config[key] ? `ON` : `OFF`}`;

	},
	autoUpgrade: function () {
		if (DragonMod.config.auto && Game.UpgradesById[324].bought) {
			Game.UpgradeDragon();
		}
		setTimeout(function () {
			DragonMod.autoUpgrade();
		}, 1000);
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
Game.registerMod("dragon mod", DragonMod);
