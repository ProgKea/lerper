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

class App {
	constructor(cellCount, cellHeight, step) {
		this.app = getElementByIdOrError("app");
		
		this.cellCount = cellCount;
		this.cellHeight = cellHeight;
		
		this.app.width = Math.floor(window.outerWidth)/4;
		this.app.height = cellCount * cellHeight;
		
		this.ctx = app.getContext("2d");
		
		this.step = step;
		this.rectWidth = this.app.width/(1/this.step);
	}
	
	updateAll(cellCount, cellHeight, step) {
		this.cellCount = cellCount;
		this.cellHeight = cellHeight;
		this.step = step;
		this.render();
	}
	
	updateCellCount(cellCount) {
		this.cellCount = cellCount;
		this.randomize();
	}
	
	updateCellHeight(cellHeight) {
		this.cellHeight = cellHeight;
		this.randomize();
	}
	
	updateStep(step) {
		this.step = step;
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
	const app = new App(1, 200, 0.1);
	app.randomize();
	app.render();
}