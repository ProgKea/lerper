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
		this.r = Math.floor(this.startR + (color.r - this.r) * t);
		this.g = Math.floor(this.startG + (color.g - this.g) * t);
		this.b = Math.floor(this.startB + (color.b - this.b) * t);
	}
	
	lerp2(color, t) {
		this.r = Math.floor(this.r + (color.r - this.r) * t);
		this.g = Math.floor(this.g + (color.g - this.g) * t);
		this.b = Math.floor(this.b + (color.b - this.b) * t);
	}

	randomize() {
		this.r = Math.floor(255 * Math.random());
		this.g = Math.floor(255 * Math.random());
		this.b = Math.floor(255 * Math.random());
		this.startR = this.r;
		this.startG = this.g;
		this.startB = this.b;
	}

	toString() {
		return `rgb(${this.r}, ${this.g}, ${this.b})`;
	}
}

function getRandomColor() {
	const color = new Color();
	color.randomize();
	return color;
}

class App {
	constructor(cellCount, cellHeight, step) {
		this.app = getElementByIdOrError("app");
		this.ctx = app.getContext("2d");
		
		// TODO: actually implement a stack
		this.colorStack = [[getRandomColor(), getRandomColor()]];
		this.updateAll(cellCount, cellHeight, step);
	}
	
	updateAppSize() {	
		this.app.width = Math.floor(window.outerWidth)/2;
		this.app.height = this.cellCount * this.cellHeight;
	}
	
	updateAll(cellCount, cellHeight, step) {
		this.updateCellCount(cellCount);
		this.updateCellHeight(cellHeight);
		this.updateStep(step);
		this.randomize();
	}
	
	updateCellHeight(cellHeight) {
		this.cellHeight = cellHeight;
		this.updateAppSize();
		this.randomize();
	}
	
	updateCellCount(cellCount) {
		this.cellCount = cellCount < 1 ? 1 : cellCount;
		this.updateAppSize();
		this.randomize();
	}

	updateStep(step) {
		this.step = step;
		this.rectWidth = this.app.width/(1/this.step);
		this.randomize();
	}
	
	randomize() {
		for (let i = 0; i < Math.floor(this.app.height/this.cellHeight); ++i) {
			const colorA = new Color();
			const colorB = new Color();
			colorA.randomize();
			colorB.randomize();
			for (let j = 0; j < 1/this.step; ++j) {
				colorA.lerp(colorB, j*this.step);
				this.ctx.fillStyle = colorA.toString();
				this.ctx.fillRect(j*this.rectWidth, i*this.cellHeight, this.rectWidth, this.cellHeight);
				
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
	const app = new App(1, 200, 0.025);
	app.randomize();
	app.render();
	
	const [randomizeButton, addRowButton, subRowButton] = 
		  [getElementByIdOrError("randomizer"), getElementByIdOrError("colorRowAdd"), getElementByIdOrError("colorRowSub")];
	randomizeButton.addEventListener("click", () => app.randomize());
	addRowButton.addEventListener("click", () => app.updateCellCount(app.cellCount+1));
	subRowButton.addEventListener("click", () => app.updateCellCount(app.cellCount-1));
}