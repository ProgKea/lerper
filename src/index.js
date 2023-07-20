function clamp(v, lo, hi) {
	return Math.max(Math.min(lo, v), v);
}

function toHex(v) {
	const hex = v.toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}

function hexToColor(hex) {
	return new Color(parseInt(hex[1]+hex[2], 16), parseInt(hex[3]+hex[4], 16), parseInt(hex[5]+hex[6], 16));
}

class Color {
	constructor(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.startR = r;
		this.startG = g;
		this.startB = b;
	}
	
	lerp(color, t) {
		this.r = clamp(Math.floor(this.startR + (color.r - this.startR) * t), 0, 255);
		this.g = clamp(Math.floor(this.startG + (color.g - this.startG) * t), 0, 255);
		this.b = clamp(Math.floor(this.startB + (color.b - this.startB) * t), 0, 255);
	}

	randomize() {
		this.r = Math.floor(255 * Math.random());
		this.g = Math.floor(255 * Math.random());
		this.b = Math.floor(255 * Math.random());
		this.startR = this.r;
		this.startG = this.g;
		this.startB = this.b;
	}
	
	toRGBString() {
		return `(${this.r.toString().padStart(3, " ")}, ${this.g.toString().padStart(3, " ")}, ${this.b.toString().padStart(3, " ")})`;
	}
	
	toHexString() {
		return "#" + toHex(this.r) + toHex(this.g) + toHex(this.b);
	}
	
	toHexStringStart() {
		return "#" + toHex(this.startR) + toHex(this.startG) + toHex(this.startB);
	}

	toStyleString() {
		return `rgb${this.toRGBString()}`;
	}
	
	toStyleStringStart() {
		return `rgb(${this.startR}, ${this.startG}, ${this.startB})`;
	}
}

function getRandomColor() {
	const color = new Color();
	color.randomize();
	return color;
}

function clamp(v, min, max) {
	return Math.min(Math.max(min, v), max);
}

class App {
	constructor(step, colorElemA, colorElemB) {
		this.app = getElementByIdOrError("app");
		this.app.width = Math.floor(window.outerWidth)/2;
		this.app.height = window.innerHeight;
		this.ctx = app.getContext("2d");

		this.historyTraversal = 0;
		this.highlightCells = [];
		this.historyCap = 100;
		this.colors = [[getRandomColor(), getRandomColor()]];
		this.step = step;
		this.previewHeight = 50;
		
		this.colorElemA = colorElemA;
		this.colorElemB = colorElemB;
	}
	
	updateStep(step) {
		if (step <= 0) {
			return;
		}
		this.step = step;
	}
	
	getCurrentColor() {
		return this.colors[Math.max(0, this.colors.length - 1 - this.historyTraversal)];
	}
	
	historyBack() {
		this.historyTraversal = Math.min(this.colors.length-1, this.historyTraversal+1);
		this.draw();
	}
	
	historyForward() {
		this.historyTraversal = Math.max(0, this.historyTraversal-1);
		this.draw();
	}
	
	updateMousePos(x, y) {
		this.mouseX = x;
		this.mouseY = y;
		this.draw();
	}
	
	selectCell() {		
		const selection = Math.ceil(clamp(this.mouseX / this.cellWidth, 1, 1/this.step+1)) - 1;
		if (!this.highlightCells.includes(selection)) {
			this.highlightCells.push(selection);
		} else {
			this.highlightCells.splice(this.highlightCells.findIndex((i) => i === selection), 1);
		}
		
		this.draw();
	}
	
	randomize() {
		if (this.colors.length >= this.historyCap) {
			for (let i = 0; i <= Math.floor(this.historyCap/2); ++i) {
				this.colors.shift();
			}
		}
		this.historyTraversal = 0;
		this.colors.push([getRandomColor(), getRandomColor()]);
		this.draw();
	}
	
	draw() {
		this.app.height = window.innerHeight;
		
		this.colorElemA.value = this.getCurrentColor()[0].toHexStringStart();
		this.colorElemB.value = this.getCurrentColor()[1].toHexStringStart();
		
		this.ctx.fillStyle = "#181818";
		this.ctx.fillRect(0, 0, this.app.width, this.app.height);

		const steps = 1/this.step+1;
		
		this.cellWidth = this.app.width/steps;
		
		for (let j = 0; j <= 1/this.step; ++j) {
			this.getCurrentColor()[0].lerp(this.getCurrentColor()[1], j*this.step);
			this.ctx.fillStyle = this.getCurrentColor()[0].toStyleString();
			this.ctx.fillRect(j*this.cellWidth, 0, this.cellWidth, this.app.height);
		}
		
		for (let j = 0; j <= 1/this.step; ++j) {
			if (this.highlightCells.includes(j)) {
				this.ctx.fillStyle = "white";
				this.ctx.fillRect(j*this.cellWidth, -this.ctx.lineWidth, this.cellWidth, 10);
			}
		}
	}
	
	render() {
		document.addEventListener("keydown", (e) => {
			switch (e.key) {
				case "r":
					this.randomize();
			}
		});
	}
}

function getElementByIdOrError(id) {
	const element = document.getElementById(id);
	if (element === null) {
		throw new Error(`Could not find element with id: ${id}`);
	}
	return element;
}

window.onload = () => {
	const initStep = 0.5;
	
	const [colorAInput, colorBInput] = [getElementByIdOrError("colorA"), getElementByIdOrError("colorB")];
	const app = new App(initStep, colorAInput, colorBInput);
	app.draw();
	app.render();
	
	const [stepText, selectedColorsRGBText, selectedColorsHexText] = [getElementByIdOrError("stepText"), getElementByIdOrError("selectedColorsRGB"), getElementByIdOrError("selectedColorsHex")];
	stepText.textContent = initStep;
	
	const [randomizeButton, backButton, forwardButton, stepSlider, selectAllButton, unselectAllButton, copyRGBButton, copyHexButton, copyAllButton] = 
	      [getElementByIdOrError("randomizer"), getElementByIdOrError("back"), getElementByIdOrError("forward"), getElementByIdOrError("step"), getElementByIdOrError("selectAll"), getElementByIdOrError("unselectAll"), getElementByIdOrError("copyRGB"), getElementByIdOrError("copyHex"), getElementByIdOrError("copyAll")];
	
	function getSelectedColors() {
		colorsRGB = [];
		colorsHex = [];
		
		app.highlightCells.sort((a, b) => a - b);
		
		for (let i = 0; i < app.highlightCells.length; ++i) {
			if (app.highlightCells[i] > 1/app.step) {
				break;
			}
			
			const [colorA, colorB] = app.getCurrentColor();
			colorA.lerp(colorB, app.highlightCells[i]*app.step);
			colorsRGB.push(colorA.toRGBString());
			colorsHex.push(colorA.toHexString());
		}
		
		return { rgb: colorsRGB, hex: colorsHex };
	}
	
	function selectCell() {
		selectedColorsRGBText.innerHTML = "";
		selectedColorsHexText.innerHTML = "";
		
		const colors = getSelectedColors();
		
		console.assert(colors.rgb.length === colors.hex.length);
		
		for (let i = 0; i < colors.rgb.length; ++i) {
			const colorElemRGB = document.createElement("li");
			colorElemRGB.style.color = "rgb" + colors.rgb[i];
			colorElemRGB.textContent = colors.rgb[i];
			selectedColorsRGBText.appendChild(colorElemRGB);
			
			const colorElemHex = document.createElement("li");
			colorElemHex.style.color = colors.hex[i];
			colorElemHex.textContent = colors.hex[i];
			selectedColorsHexText.appendChild(colorElemHex);
		}
	}
	
	randomizeButton.addEventListener("click", () => {
		app.randomize()
		selectCell();
	});
	backButton.addEventListener("click", () => {
		app.historyBack()
		selectCell();
	});
	forwardButton.addEventListener("click", () => {
		app.historyForward();
		selectCell();
	});
	
	selectAllButton.addEventListener("click", () => {
		app.highlightCells = [];
		for (let i = 0; i <= 1/app.step; ++i) {
			app.highlightCells.push(i);
		}
		selectCell();
		app.draw();
	});
	
	unselectAllButton.addEventListener("click", () => {
		app.highlightCells = [];
		selectCell();
		app.draw();
	});
	console.log(copyRGBButton);
	copyRGBButton.addEventListener("click", () => {
		const colorsRGB = getSelectedColors().rgb;
		navigator.clipboard.writeText(colorsRGB.join(" "));
	});
	copyHexButton.addEventListener("click", () => {
		const colorsHex = getSelectedColors().hex;
		navigator.clipboard.writeText(colorsHex.join(" "));
	});
	copyAllButton.addEventListener("click", () => {
		const colorsRGB = getSelectedColors().rgb;
		const colorsHex = getSelectedColors().hex;
		navigator.clipboard.writeText(colorsRGB.join(" ") + " " + colorsHex.join(" "));
	});
	
	stepSlider.addEventListener("input", (e) => {
		app.updateStep(e.target.value);
		stepText.textContent = app.step;
		selectCell();
		app.draw();
	});
	
	app.colorElemA.addEventListener("change", (e) => {
		app.getCurrentColor()[0] = hexToColor(e.target.value);
		app.draw();
	});
	
	app.colorElemB.addEventListener("change", (e) => {
		app.getCurrentColor()[1] = hexToColor(e.target.value);
		app.draw();
	});
	
	app.app.addEventListener("mousemove", (e) => {
		app.updateMousePos(e.x, e.y);
		getSelectedColors();
	});
	app.app.addEventListener("mousedown", () => {
		app.selectCell();
		selectCell();
	});
	
	window.addEventListener("resize", () => app.draw());
}