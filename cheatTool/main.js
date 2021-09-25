const CheatTool = {
	labelList: {
		summonGolden: "ランダムGC召喚",
		summonGoldenForce: "任意GC召喚",
		cookieStorm: "クッキーストーム召喚",
	},
	config: {
		summonGolden: null,
		summonGoldenForce: null,
		gcChoice: "",
		cookieStorm: null,
	},
	goldenCookieChoices: [
		{ "id": "cookie storm", "name": "クッキー乱舞" },
		{ "id": "cookie storm drop", "name": "クッキー乱舞で出てくるクッキー" },
		{ "id": "dragonflight", "name": "ドラゴンフライト" },
		{ "id": "click frenzy", "name": "クリックフィーバー" },
		{ "id": "cursed finger", "name": "呪われた指" },
		{ "id": "clot", "name": "障害発生" },
		{ "id": "blood frenzy", "name": "エルダーフィーバー" },
		{ "id": "ruin cookies", "name": "台無し！" },
		{ "id": "multiply cookies", "name": "ラッキー！" },
		{ "id": "everything must go", "name": "売りつくし" },
		{ "id": "dragon harvest", "name": "ドラゴンハーベスト" },
		{ "id": "frenzy", "name": "フィーバー" },
		{ "id": "building special", "name": "建物パワー" },
		{ "id": "free sugar lump", "name": "ナイス！" },
		{ "id": "blab", "name": "フレーバーテキスト" },
		{ "id": "chain cookie", "name": "クッキーチェーン" }
	],
	init: function () {
		setTimeout(function () {
			CheatTool.modInit();
		}, 1000);
	},
	modInit: function () {
		CheatTool.appendConfig();
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
						<div class="title">cheat tool</div>
						<div class="listing">`;
				for (const key in CheatTool.config) {
					if (["summonGolden", "summonGoldenForce", "cookieStorm"].includes(key)) {
						div.innerHTML += `
						<a id="cheat-tool-${key}" class="smallFancyButton option"
						onclick="CheatTool.cheatComand('${key}');">${CheatTool.labelList[key]}</a>
						<br>`;
					}
					if (key == "gcChoice") {
						for (let i = 0; i < CheatTool.goldenCookieChoices.length; i++) {
							const c = CheatTool.goldenCookieChoices[i];
							div.innerHTML += `
							<label for="cheat-tool-${key}-${i}"><input type="radio"
								id="cheat-tool-${key}-${i}" name="${key}"
								value="${i}" ${c.id == CheatTool.config.gcChoice ? `checked` : ``}
								onchange="CheatTool.changeGCChoise(${i})"/>${c.name}</label>
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
	changeGCChoise: function (i) {
		CheatTool.config.gcChoice = CheatTool.goldenCookieChoices[i].id;
	},
	cheatComand: function (key) {
		switch (key) {
			case "summonGolden":
				CheatTool.summonGolden();
				break;
			case "summonGoldenForce":
				CheatTool.summonGoldenForce();
				break;
			case "cookieStorm":
				CheatTool.callStorm();
				break;
			default:
				break;
		}
	},
	summonGolden: function () {
		const newShimmer = new Game.shimmer("golden");
		Game.shimmers.push(newShimmer);
	},
	summonGoldenForce: function () {
		const newShimmer = new Game.shimmer("golden");
		newShimmer.force = CheatTool.config.gcChoice;
		newShimmer.pop();
	},
	callStorm: function () {
		const newShimmer = new Game.shimmer("golden");
		newShimmer.force = "cookie storm";
		newShimmer.pop();
	},
	save: function () {
		//use this to store persistent data associated with your mod
	},
	load: function (str) {
		//do stuff with the string data you saved previously
	},
}
Game.registerMod("cheat tool", CheatTool);
