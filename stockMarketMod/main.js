const StockMarketMod = {
	dataRowCss: `margin:1px 0px;
	display:block;
	font-size:12px;
	width:100%;
	background:linear-gradient(to right,transparent,#333,#333,transparent);
	padding:2px 0px;
	overflow:hidden;
	white-space:nowrap;`,
	labelList: {
		mode: "モード",
		tick: "残時間",
		buy: "購入",
		broker: "ブローカー雇用",
		auto: "自動売買",
		notify: "通知",
		changeTime: "ティック時間操作",
		time: "ティック時間変更",
	},
	modeText: ["安定", "上昇", "下降", "急上昇", "急下降", "乱高下"],
	riseMode: [1, 3],
	fallMode: [2, 4],
	colors: {
		"safe": "cyan",
		"notice": "lime",
		"caution": "yellow",
		"warning": "red",
	},
	buyButtonList: ["1", "10", "100", "Max"],
	sellButtonList: ["-1", "-10", "-100", "-All"],
	config: {
		mode: true,
		tick: true,
		buy: true,
		broker: true,
		auto: true,
		notify: true,
		changeTime: false,
		time: 60,
	},
	dataList: {},
	init: function () {
		setTimeout(function () {
			StockMarketMod.modInit();
		}, 1000);
	},
	modInit: function () {
		StockMarketMod.PARENT = Game.Objects["Bank"];
		StockMarketMod.M = Game.Objects["Bank"].minigame;
		StockMarketMod.appendConfig();
		StockMarketMod.mainFunc();
		Game.registerHook("reincarnate", function () {
			for (var i = 0; i < StockMarketMod.M.goodsById.length; i++) {
				const me = StockMarketMod.M.goodsById[i];
				StockMarketMod.dataList[me.id] = {
					buyValue: 0,
					beforeMode: 0,
				};
				StockMarketMod.addBuyEvent(me);
				StockMarketMod.addSellEvent(me);
			}
		});
	},
	mainFunc: function () {
		if (!StockMarketMod.activeCheck()) {
			setTimeout(function () {
				StockMarketMod.mainFunc();
			}, 1000);
			return;
		}
		StockMarketMod.updateBGinfo();
		StockMarketMod.autoTrading();
		StockMarketMod.changeTickTime();
		StockMarketMod.buyBroker();
	},
	activeCheck: function () {
		return (StockMarketMod.PARENT.amount > 0 && StockMarketMod.PARENT.level > 0)
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
						<div class="title">stock market mod</div>
						<div class="listing">`;
				for (const key in StockMarketMod.config) {
					if (["mode", "tick", "buy", "auto", "broker", "notify"].includes(key)) {
						div.innerHTML += `
						<a id="stock-market-mod-${key}" class="smallFancyButton option ${(StockMarketMod.config[key] ? '' : 'off')}"
						onclick="StockMarketMod.toggleConfig('${key}');">${StockMarketMod.labelList[key]}${StockMarketMod.config[key] ? `ON` : `OFF`}</a>
						<br>`;
					}
					if (key == "changeTime") {
						div.innerHTML += `
						<a id="stock-market-mod-${key}" class="smallFancyButton option ${(StockMarketMod.config[key] ? '' : 'off')}"
						onclick="StockMarketMod.toggleChangeTime();">${StockMarketMod.labelList[key]}${StockMarketMod.config[key] ? `ON` : `OFF`}</a>
						<br>`;
					}
					if (key == "time") {
						div.innerHTML += `
						<a id="stock-market-mod-change-time-button" class="smallFancyButton option"
						onclick="StockMarketMod.changeTickTimeButton();">${StockMarketMod.labelList[key]}</a>
						<input type="number" id="stock-market-mod-time" style="width:3em;"
						min="1" max="120" step="1" value="${StockMarketMod.config[key] || 60}"
						onchange="StockMarketMod.changeTime();"/>
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
		StockMarketMod.config[key] = !StockMarketMod.config[key];
		const button = document.getElementById(`stock-market-mod-${key}`);
		button.className = `smallFancyButton option ${StockMarketMod.config[key] ? '' : ' off'}`;
		button.innerHTML = `${StockMarketMod.labelList[key]}${StockMarketMod.config[key] ? `ON` : `OFF`}`;
		if (["mode", "tick", "buy", "auto"].includes(key)) {
			StockMarketMod.updateBGinfo();
		}
	},
	toggleChangeTime: function () {
		const key = "changeTime"
		if (StockMarketMod.config[key]) {
			StockMarketMod.changeTickTime(60);
			StockMarketMod.config[key] = !StockMarketMod.config[key];
		} else {
			StockMarketMod.config[key] = !StockMarketMod.config[key];
			StockMarketMod.changeTickTime();
		}
		const button = document.getElementById(`stock-market-mod-${key}`);
		button.className = `smallFancyButton option ${StockMarketMod.config[key] ? '' : ' off'}`;
		button.innerHTML = `${StockMarketMod.labelList[key]}${StockMarketMod.config[key] ? `ON` : `OFF`}`;
	},
	changeTime: function () {
		const key = "time"
		const input = document.getElementById(`stock-market-mod-${key}`);
		StockMarketMod.config[key] = input.value;
	},
	changeTickTimeButton: function () {
		StockMarketMod.changeTickTime();
	},
	updateBGinfo: function () {
		setTimeout(function () {
			StockMarketMod.updateBGinfo();
		}, 500);
		for (var i = 0; i < StockMarketMod.M.goodsById.length; i++) {
			const me = StockMarketMod.M.goodsById[i];
			if (!document.querySelector(`#bankGood-${me.id} .bg-mode`)) {
				StockMarketMod.appendBGinfo(me);
			}
			StockMarketMod.updateModeInfo(me);
			StockMarketMod.updateTickInfo(me);
			StockMarketMod.updateBuyInfo(me);
		}
	},
	appendBGinfo: function (me) {
		const d = document.querySelector(`#bankGood-${me.id}`).firstElementChild;
		if (!StockMarketMod.dataList[me.id]) {
			StockMarketMod.dataList[me.id] = {
				buyValue: 0,
				beforeMode: 0,
			};
		}
		["mode", "tick", "buy"].forEach(key => {
			const div = document.createElement("div");
			div.classList = [`bg-${key}`];
			div.append(`${StockMarketMod.labelList[key]}: --`);
			d.insertBefore(div, d.child);
		});
		StockMarketMod.addBuyEvent(me);
		StockMarketMod.addSellEvent(me);
	},
	addBuyEvent: function (me) {
		StockMarketMod.buyButtonList.forEach(t => {
			const data = StockMarketMod.dataList[me.id];
			const b = document.querySelector(`#bankGood-${me.id}_${t}`);
			b.addEventListener("click", () => {
				data.buyValue = me.val;
			});
		});
	},
	addSellEvent: function (me) {
		StockMarketMod.sellButtonList.forEach(t => {
			const data = StockMarketMod.dataList[me.id];
			const b = document.querySelector(`#bankGood-${me.id}_${t}`);
			b.addEventListener("click", () => {
				data.buyValue = 0;
			});
		});
	},
	updateModeInfo: function (me) {
		const mode = document.querySelector(`#bankGood-${me.id} .bg-mode`);
		mode.style.cssText = StockMarketMod.dataRowCss;
		if (!StockMarketMod.config.mode) {
			mode.innerText = `${StockMarketMod.labelList.mode}: --`;
			return;
		}
		mode.innerText = `${StockMarketMod.labelList.mode}: ${StockMarketMod.modeText[me.mode]}`;
		if (StockMarketMod.riseMode.includes(me.mode)) {
			mode.style.cssText += `color: ${StockMarketMod.colors.notice};`;
		} else if (StockMarketMod.fallMode.includes(me.mode)) {
			mode.style.cssText += `color: ${StockMarketMod.colors.warning};`;
		} else if (me.mode == 5) {
			mode.style.cssText += `color: ${StockMarketMod.colors.caution};`;
		} else {
			mode.style.cssText += `color: ${StockMarketMod.colors.safe};`;
		}
	},
	updateTickInfo: function (me) {
		const tick = document.querySelector(`#bankGood-${me.id} .bg-tick`);
		tick.style.cssText = StockMarketMod.dataRowCss;
		if (!StockMarketMod.config.tick) {
			tick.innerText = `${StockMarketMod.labelList.tick}: --`;
			return;
		}
		tick.innerText = `${StockMarketMod.labelList.tick}: ${me.dur}`;
		if (Number(me.dur) <= 15) {
			tick.style.cssText += `color: ${StockMarketMod.colors.warning};`;
		} else if (Number(me.dur) <= 30) {
			tick.style.cssText += `color: ${StockMarketMod.colors.caution};`;
		}
	},
	updateBuyInfo: function (me) {
		const buy = document.querySelector(`#bankGood-${me.id} .bg-buy`);
		buy.style.cssText = StockMarketMod.dataRowCss;
		if (!StockMarketMod.config.buy) {
			buy.innerText = `${StockMarketMod.labelList.buy}: --`;
			return;
		}
		const data = StockMarketMod.dataList[me.id];
		const roundVal = Math.round(data.buyValue * 100) / 100;
		buy.innerText = `${StockMarketMod.labelList.buy}: $${roundVal}`;
		if (data.buyValue == 0) {
			buy.style.cssText += `color: ${StockMarketMod.colors.safe};`;
		} else if (data.buyValue < me.val) {
			buy.style.cssText += `color: ${StockMarketMod.colors.notice};`;
		} else {
			buy.style.cssText += `color: ${StockMarketMod.colors.warning};`;
		}
	},
	changeTickTime: function (t) {
		const time = t || StockMarketMod.config["time"];
		if (StockMarketMod.config["changeTime"]) {
			StockMarketMod.M.secondsPerTick = time;
			Game.Notify(`ティック変更：${time}秒`, ``, [16, 5]);
		}
	},
	autoTrading: function () {
		for (var i = 0; i < StockMarketMod.M.goodsById.length; i++) {
			const me = StockMarketMod.M.goodsById[i];
			const data = StockMarketMod.dataList[me.id];
			if (StockMarketMod.activeCheck() && me.building.highest != 0 && StockMarketMod.config.auto) {
				if ((me.val < 5)
					|| (StockMarketMod.fallMode.includes(data.beforeMode) && !StockMarketMod.fallMode.includes(me.mode))
					|| (!StockMarketMod.riseMode.includes(data.beforeMode) && StockMarketMod.riseMode.includes(me.mode))
				) {
					StockMarketMod.maxBuy(me);
				}
				if ((StockMarketMod.riseMode.includes(data.beforeMode) && !StockMarketMod.riseMode.includes(me.mode))
					|| (!StockMarketMod.fallMode.includes(data.beforeMode) && StockMarketMod.fallMode.includes(me.mode))
					|| (data.beforeMode == 4 && me.mode == data.beforeMode && me.val > 15)
				) {
					StockMarketMod.maxSell(me);
				}
			}
			data.beforeMode = me.mode;
		}
		setTimeout(function () {
			StockMarketMod.autoTrading();
		}, 1000);
	},
	maxBuy: function (me) {
		const data = StockMarketMod.dataList[me.id];
		if (me.stock < StockMarketMod.M.getGoodMaxStock(me) && StockMarketMod.M.buyGood(me.id, 10000)) {
			data.buyValue = me.val;
			if (StockMarketMod.config.notify) {
				Game.Notify(`自動購入：${me.name}`, ``, [15, 1]);
			}
		}
	},
	maxSell: function (me) {
		const data = StockMarketMod.dataList[me.id];
		if (me.stock > 0 && StockMarketMod.M.sellGood(me.id, 10000)) {
			data.buyValue = 0;
			if (StockMarketMod.config.notify) {
				Game.Notify(`自動売却：${me.name}`, ``, [15, 2]);
			}
		}
	},
	buyBroker: function () {
		if (StockMarketMod.activeCheck() && StockMarketMod.config.broker && StockMarketMod.M.brokers < StockMarketMod.M.getMaxBrokers()) {
			const button = document.getElementById("bankBrokersBuy");
			button.click();
		}
		setTimeout(function () {
			StockMarketMod.buyBroker();
		}, 1000);
	},
	save: function () {
		//use this to store persistent data associated with your mod
		const s = {
			dataList: StockMarketMod.dataList,
			config: StockMarketMod.config
		}
		return JSON.stringify(s)
	},
	load: function (str) {
		//do stuff with the string data you saved previously
		const l = JSON.parse(str);
		if (l.dataList) {
			StockMarketMod.dataList = l.dataList;
		}
		if (l.config) {
			for (const key in l.config) {
				StockMarketMod.config[key] = l.config[key];
			}
		}
	},
};
Game.registerMod("stock market mod", StockMarketMod);
