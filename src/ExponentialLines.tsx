import P5 from "p5";

const barWidth = 2;

let myRng = 0.1;
function myRandom(max: number) {
	myRng += Math.E * myRng;
	myRng -= Math.floor(myRng);
	return myRng * max;
}

function drawBar(p5: P5, x: number, y: number, barHeightMultiplier: number) {
	p5.fill(0, 0, 255);
	const barHeight = barWidth * barHeightMultiplier;
	x = x - x % barWidth;
	y = y - y % barHeight;
	p5.rect(x, y, barWidth, barHeight);
}

function drawBars(p5: P5, exp: number, heightMultiplier: number, count: number) {
	for (let i = 0; i < count; i++) {
		let x = p5.exp(-myRandom(exp)) * p5.width;
		x = p5.floor(x);
		let y = myRandom(p5.height);
		y = p5.floor(y);
		drawBar(p5, x, y, heightMultiplier);
	}
}

export function p5_ExponentialLines(p5: P5) {

	drawBars(p5, 4, 1, p5.height / 8);
	drawBars(p5, 17, 4, p5.height / 16);
	drawBars(p5, 61, 16, p5.height / 32);

}
