const GrimoireMod = {
	labelList: {
		auto: "自動詠唱",
		spell1: "詠唱呪文",
	},
	config: {
		auto: true,
		spell1: "",
	},
	spellSelectList: [],
	init: function () {
		setTimeout(function () {
			GrimoireMod.modInit();
		}, 1000);
	},
	modInit: function () {
		GrimoireMod.PARENT = Game.Objects["Wizard tower"];
		GrimoireMod.M = Game.Objects["Wizard tower"].minigame;
		for (const key in GrimoireMod.M.spells) {
			GrimoireMod.spellSelectList.push({
				id: key,
				value: GrimoireMod.M.spells[key].name,
			});
		}
		if (!GrimoireMod.config.spell1) {
			GrimoireMod.config.spell1 = GrimoireMod.spellSelectList[0].id;
		}
		GrimoireMod.appendConfig();
		setTimeout(function () {
			GrimoireMod.checkMagic();
		}, 1000);
	},
	activeCheck: function () {
		return (GrimoireMod.PARENT.amount > 0 && GrimoireMod.PARENT.level > 0)
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
						<div class="title">grimoire mod</div>
						<div class="listing">`;
				for (const key in GrimoireMod.config) {
					if (key == "auto") {
						div.innerHTML += `
						<a id="grimoire-mod-${key}" class="smallFancyButton option ${(GrimoireMod.config[key] ? '' : 'off')}"
						onclick="GrimoireMod.toggleAutoSpell('${key}');">${GrimoireMod.labelList[key]}${GrimoireMod.config[key] ? `ON` : `OFF`}</a>
						<br>`;
					}
					if (key == "spell1") {
						div.innerHTML += `
						<a id="grimoire-mod-change-${key}-button" class="smallFancyButton option">${GrimoireMod.labelList[key]}</a>
						<br>`;
						for (let i = 0; i < GrimoireMod.spellSelectList.length; i++) {
							const s = GrimoireMod.spellSelectList[i];
							div.innerHTML += `
							<label for="grimoire-mod-${key}-${i}"><input type="radio"
								id="grimoire-mod-${key}-${i}" name="${key}"
								value="${i}" ${s.id == GrimoireMod.config.spell1 ? `checked` : ``}
								onchange="GrimoireMod.changeSpell('${key}', ${i})"/>${s.value}</label>
							<br>`;
						}
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
	toggleAutoSpell: function () {
		const key = "auto";
		GrimoireMod.config[key] = !GrimoireMod.config[key];
		const button = document.getElementById(`grimoire-mod-${key}`);
		button.className = `smallFancyButton option ${GrimoireMod.config[key] ? '' : ' off'}`;
		button.innerHTML = `${GrimoireMod.labelList[key]}${GrimoireMod.config[key] ? `ON` : `OFF`}`;

	},
	changeSpell: function (key, i) {
		const spell = GrimoireMod.spellSelectList[i];
		GrimoireMod.config[key] = spell.id;
	},
	checkMagic: function () {
		if (GrimoireMod.activeCheck() && GrimoireMod.M.magic == GrimoireMod.M.magicM) {
			GrimoireMod.useSpell();
		}
		setTimeout(function () {
			GrimoireMod.checkMagic()
		}, 1000);
	},
	useSpell: function () {
		if (!GrimoireMod.config.auto || !GrimoireMod.config.spell1) {
			return;
		}
		const spell = GrimoireMod.M.spells[GrimoireMod.config.spell1];
		if (GrimoireMod.M.castSpell(spell)) {
			Game.Notify(`自動詠唱：${spell.name}`, ``, [17, 0]);
		}
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
Game.registerMod("grimoire mod", GrimoireMod);
