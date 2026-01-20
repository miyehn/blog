import P5 from "p5";

export function p5_ExcerptCollapseHandle(p5: P5) {

	p5.noStroke();

	const gridSize = 4;
	const wrap = 8;

	const rows = Math.floor(p5.height / gridSize);
	const cols = Math.floor(p5.width / gridSize);
	for (let x = 0; x < cols; x++) {
		for (let y = 0; y < rows; y++) {
			const i = rows * x + y;
			const iMod = i % wrap;
			let r = (iMod / wrap) * 255 / 2;
			let g = 0;//(iMod / wrap) * 255 / 2;
			let b = 0;//(iMod / wrap) * 255;
			if (iMod % wrap === wrap - 3) {
				r = 255;
				g = 0;
				b = 0;
			}
			p5.fill(r, g, b);
			p5.rect(x * gridSize, y * gridSize, gridSize, gridSize);
		}
	}

}

export function p5_BlockquoteLine(p5: P5) {
	p5.noStroke();
	p5.fill(31, 56, 96);
	p5.rect(0, 0, 4, p5.height);
	p5.fill(192, 112, 255);
	for (let y = 4; y < p5.height - 4; y += 12) {
		p5.rect(3, y, 4, 4);
	}
}