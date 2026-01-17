import P5 from "p5";
import {P5Canvas} from "./Utils.tsx";

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
	p5.pixels[pixelIdx] = Math.floor(color.r);
	p5.pixels[pixelIdx + 1] = Math.floor(color.g);
	p5.pixels[pixelIdx + 2] = Math.floor(color.b);
	p5.pixels[pixelIdx + 3] = Math.floor(color.a);
}

// from gpt:
function clamp255(v: number) {
	return v < 0 ? 0 : v > 255 ? 255 : v;
}

function blendPixelAdditive(p5: P5, x: number, y: number, src: PixelColor) {
	if (x < 0 || x >= p5.width || y < 0 || y >= p5.height) return;

	const pixelIdx = (y * p5.width + x) * 4;

	const dr = p5.pixels[pixelIdx];
	const dg = p5.pixels[pixelIdx + 1];
	const db = p5.pixels[pixelIdx + 2];
	const da = p5.pixels[pixelIdx + 3];

	const sa = clamp255(src.a) / 255;

	p5.pixels[pixelIdx]     = clamp255(dr + src.r * sa);
	p5.pixels[pixelIdx + 1] = clamp255(dg + src.g * sa);
	p5.pixels[pixelIdx + 2] = clamp255(db + src.b * sa);
	p5.pixels[pixelIdx + 3] = clamp255(da + src.a);
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

function gaussian(x: number, mu: number, sigma: number): number {
	const z = (x - mu) / sigma;
	return Math.exp(-0.5 * z * z);
}

function p5setup(p5: P5) {
	p5.background(0);
	p5.noStroke();

	const gridSize = 64;
	const gridX = Math.ceil(p5.width / gridSize);
	const gridY = Math.ceil(p5.height / gridSize);

	const contentStartGridIdx = getContentLeft() / gridSize * gridY;
	const easeInGridCount = Math.floor(gridY * 2.7);
	const easeInGridEnd = contentStartGridIdx + gridY - 5;

	p5.loadPixels();

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

	// bloom ?
	const center = {x: -p5.width * 0.54, y: p5.height * 0.8};
	const sigma = p5.width * 0.36;
	for (let x = 0; x < p5.width; x++) {
		for (let y = 0; y < p5.height; y++) {
			let dx = x - center.x;
			let dy = y - center.y;
			let distToCenter = Math.sqrt(dx * dx + dy * dy);
			let distributed = gaussian(distToCenter, 0, sigma);

			const multiplier = 1000;
			const bloomColor = {
				r: 0.7,
				g: 0.5,
				b: 1.1
			};
			blendPixelAdditive(p5, x, y, {
				r: bloomColor.r * multiplier,
				g: bloomColor.g * multiplier,
				b: bloomColor.b * multiplier,
				a: 255 * distributed
			});
		}
	}

	p5.updatePixels();

}

export function BackgroundCanvas(props: {
	width: number,
	height: number
}) {
	return <P5Canvas style={{
		position: "fixed",
		top: 0,
		left: 0,
		zIndex: -100,
		pointerEvents: "none",
	}} width={props.width} height={props.height} trueDpr={false} p5setup={p5setup}/>
}
