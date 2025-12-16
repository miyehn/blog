import P5 from "p5";
import {useEffect, useId, useRef} from "react";

export const BackgroundProps = {
	gridSize: 64
};

export function getContentLeft() {
	return Math.floor(window.innerWidth * 0.36 / BackgroundProps.gridSize) * BackgroundProps.gridSize;
}

export function getContentWidth() {
	return Math.floor(window.innerWidth * 0.62 / BackgroundProps.gridSize) * BackgroundProps.gridSize;
}

type PixelColor = {
	r: number,
	g: number,
	b: number,
	a: number
};

function loadPixel(p5: P5, x: number, y: number) {
	if (x < 0 || x >= p5.width || y < 0 || y >= p5.height) {
		return {r: 0, g: 0, b: 0, a: 0};
	}
	const pixelIdx = (y * p5.width + x) * 4;
	return {
		r: p5.pixels[pixelIdx],
		g: p5.pixels[pixelIdx + 1],
		b: p5.pixels[pixelIdx + 2],
		a: p5.pixels[pixelIdx + 3],
	}
}

function writePixel(p5: P5, x: number, y: number, color: PixelColor) {
	if (x < 0 || x >= p5.width || y < 0 || y >= p5.height) {
		return;
	}
	const pixelIdx = (y * p5.width + x) * 4;
	p5.pixels[pixelIdx + 0] = Math.floor(color.r);
	p5.pixels[pixelIdx + 1] = Math.floor(color.g);
	p5.pixels[pixelIdx + 2] = Math.floor(color.b);
	p5.pixels[pixelIdx + 3] = Math.floor(color.a);
}

function drawSquareWithErosion(p5: P5, X: number, Y: number, erosion: number) {
	const subgridCount = 8;
	const subgridSize = BackgroundProps.gridSize / subgridCount;

	for (let subgridY = 0; subgridY < subgridCount; subgridY++) {
		for (let subgridX = 0; subgridX < subgridCount; subgridX++) {
			if ((subgridX + subgridY) % 2 === 1) {
				const subgridCenterX = X + (subgridX + 0.5) * subgridSize;
				const subgridCenterY = Y + (subgridY + 0.5) * subgridSize;
				const radius = Math.floor(subgridSize * erosion * 2);

				for (let y = subgridCenterY - radius; y < subgridCenterY + radius; y++) {
					for (let x = subgridCenterX - radius; x < subgridCenterX + radius; x++) {
						const px = loadPixel(p5, x, y);

						let normalizedDist = 1 - Math.min(1, Math.sqrt((y - subgridCenterY) * (y - subgridCenterY) + (x - subgridCenterX) * (x - subgridCenterX)) / radius);
						let color = {
							r: 15,
							g: px.g + normalizedDist * 255,
							b: 112,
							a: 255
						};
						const channelCap = 127;
						let channelOverflowSum = Math.max(0, (color.r - channelCap) + (color.g - channelCap) + (color.b - channelCap));
						if (channelOverflowSum > 0) {
							color.r = 255;
							color.g = 255;
							color.b = 255;
						}
						writePixel(p5, x, y, color);
					}
				}
			}
		}
	}
}

function p5setup(p5: P5) {
	p5.background(0);
	p5.noStroke();

	const gridSize = 64;
	const gridX = Math.ceil(p5.width / gridSize);
	const gridY = Math.ceil(p5.height / gridSize);

	const contentStartGridIdx = getContentLeft() / gridSize * gridY;
	//const contentEndGridIdx = contentStartGridIdx + getContentWidth() / gridSize * gridY;
	const easeInGridCount = Math.floor(gridY * 2.7);
	const easeInGridEnd = contentStartGridIdx + gridY - 5;

	p5.loadPixels();

	/*
	for (let y = 0; y < p5.height / 8; y += gridSize / 4) {
		for (let x = 0; x < p5.width; x += gridSize / 2) {
			writePixel(p5, x, y, {r: 255, g: 0, b: 127, a: 255});
		}
	}
	 */

	for (let Y = 0; Y < gridY; Y++) {
		for (let X = 0; X < gridX; X++) {
			const gridIdx = X * gridY + Y;
			let strength = 1 - (gridIdx + easeInGridCount - easeInGridEnd) / easeInGridCount;
			const jitter = gridIdx % 2 === 0 ? (1 / (easeInGridCount - 3)) : 0;//Math.random() * 0.12 - 0.06;
			strength += jitter;
			strength = Math.max(0, strength);
			strength = Math.min(1, strength);
			drawSquareWithErosion(p5, X * gridSize, p5.height - (Y + 1) * gridSize, strength);
		}
	}
	p5.updatePixels();
}

export function TestCanvas(props: {
	top: number,
	left: number,
	width: number,
	height: number
}) {
	const id = useId();

	const divRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const sketch = (p5: P5) => {
		p5.setup = () => {
			p5.createCanvas(props.width, props.height, canvasRef.current ?? undefined);
			p5.pixelDensity(1);
			p5setup(p5);
		}
	};

	useEffect(() => {
		new P5(sketch, divRef.current ?? undefined);
	}, []);

	return <div ref={divRef} style={{
		position: "fixed",
		top: props.top,
		left: props.left
	}} id={id}><canvas ref={canvasRef} width={props.width} height={props.height}></canvas></div>
}