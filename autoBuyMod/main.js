const AutoBuyMod = {
	labelList: {
		buildings: "建物購入",
		upgrades: "アップグレード購入",
		saving: "貯金(0-21600)",
	},
	config: {
		buildings: true,
		buildingsAmount: 10,
		upgrades: true,
		saving: 3600,
	},
	init: function () {
		setTimeout(function () {
			AutoBuyMod.modInit();
		}, 1000);
	},
	modInit: function () {
		AutoBuyMod.appendConfig();
		AutoBuyMod.autoBuy();
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
						<div class="title">auto buy mod</div>
						<div class="listing">`;
				for (const key in AutoBuyMod.config) {
					if (["buildings", "upgrades", "research"].includes(key)) {
						div.innerHTML += `
						<a id="auto-buy-mod-${key}" class="smallFancyButton option ${(AutoBuyMod.config[key] ? '' : 'off')}"
						onclick="AutoBuyMod.toggleConfig('${key}');">${AutoBuyMod.labelList[key]}${AutoBuyMod.config[key] ? `ON` : `OFF`}</a>
						<br>`;
					}
					if (key == "saving") {
						div.innerHTML += `
						<a id="auto-buy-mod-${key}-button" class="smallFancyButton option">${AutoBuyMod.labelList[key]}</a>
						<input type="number" id="auto-buy-mod-${key}" style="width:6em;"
						min="0" max="21600" step="1" value="${AutoBuyMod.config[key] || 1}"
						onchange="AutoBuyMod.changeNumConfig('${key}');"/>
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
		AutoBuyMod.config[key] = !AutoBuyMod.config[key];
		const button = document.getElementById(`auto-buy-mod-${key}`);
		button.className = `smallFancyButton option ${AutoBuyMod.config[key] ? '' : ' off'}`;
		button.innerHTML = `${AutoBuyMod.labelList[key]}${AutoBuyMod.config[key] ? `ON` : `OFF`}`;

	},
	changeNumConfig: function (key) {
		const input = document.getElementById(`auto-buy-mod-${key}`);
		AutoBuyMod.config[key] = input.value;
	},
	autoBuy: function () {
		const list = [];
		if (AutoBuyMod.config.buildings) {
			list.push(AutoBuyMod.getLowPriceBuilding());
		}
		if (AutoBuyMod.config.upgrades) {
			list.push(AutoBuyMod.getLowPriceUpgrade());
		}
		if (list.length > 0) {
			list.sort(function (a, b) {
				return a.price - b.price;
			});
			const target = list[0];
			if (target.price + (Game.cookiesPsRawHighest * AutoBuyMod.config.saving) < Game.cookies) {
				Game.Notify(`自動購入：${target.name}`, ``, [16, 5]);
				if (target.type == "buildings") {
					AutoBuyMod.buyBuilding(target.key);
				} else if (target.type == "upgrades") {
					AutoBuyMod.buyUpgrade(target.key);
				}
			}
		}
		setTimeout(function () {
			AutoBuyMod.autoBuy();
		}, 500);
	},
	getLowPriceBuilding: function () {
		const list = [];
		for (const key in Game.Objects) {
			const o = Game.Objects[key];
			const t = {
				type: "buildings",
				key: key,
				price: o.getSumPrice(AutoBuyMod.config.buildingsAmount),
				name: o.dname,
			};
			list.push(t);
		}
		list.sort(function (a, b) {
			return a.price - b.price;
		});
		return list[0];
	},
	getLowPriceUpgrade: function () {
		const list = [];
		for (const key in Game.UpgradesInStore) {
			const u = Game.UpgradesInStore[key];
			if (u.pool != "toggle" && u.pool != "tech") {
				const t = {
					type: "upgrades",
					key: u.id,
					price: u.getPrice(),
					name: u.dname,
				};
				list.push(t);
				continue;
			}
			if (u.pool == "tech" && u.id < 69) {
				const t = {
					type: "upgrades",
					key: u.id,
					price: u.basePrice,
					name: u.dname,
				};
				list.push(t);
				continue;
			}
		}
		list.sort(function (a, b) {
			return a.price - b.price;
		});
		return list[0];
	},
	buyBuilding: function (key) {
		const o = Game.Objects[key];
		o.buy(AutoBuyMod.config.buildingsAmount);
	},
	buyUpgrade: function (key) {
		Game.UpgradesById[key].buy();
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
Game.registerMod("auto buy mod", AutoBuyMod);
