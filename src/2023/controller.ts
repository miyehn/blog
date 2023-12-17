import {setProjectionParams} from "./main";

class Controller {

	#cameraOffsetX: number = 0;
	#cameraOffsetY: number = 0;
	#cameraOffsetZ: number = 0;
	#rotateXRad: number = 0;
	#rotateYRad: number = 0;

	#key_UP: boolean = false;
	#key_DOWN: boolean = false;
	#key_LEFT: boolean = false;
	#key_RIGHT: boolean = false;
	#key_W: boolean = false;
	#key_A: boolean = false;
	#key_S: boolean = false;
	#key_D: boolean = false;
	#key_Q: boolean = false;
	#key_E: boolean = false;

	// should be readonly outside of #runLoop()
	#looping: boolean = false;

	#anyKeyDown(): boolean {
		return this.#key_W || this.#key_A || this.#key_S || this.#key_D || this.#key_Q || this.#key_E ||
			this.#key_UP || this.#key_DOWN || this.#key_LEFT || this.#key_RIGHT;
	}

	onKeyDown(key: string) {
		if (key === 'w' || key === 'W') {
			this.#key_W = true;
		} else if (key === 'a' || key === 'A') {
			this.#key_A = true;
		} else if (key === 's' || key === 'S') {
			this.#key_S = true;
		} else if (key === 'd' || key === 'D') {
			this.#key_D = true;
		} else if (key === 'q' || key === 'Q') {
			this.#key_Q = true;
		} else if (key === 'e' || key === 'E') {
			this.#key_E = true;
		}
		else if (key === "ArrowUp") {
			this.#key_UP = true;
		} else if (key === "ArrowDown") {
			this.#key_DOWN = true;
		} else if (key === "ArrowLeft") {
			this.#key_LEFT = true;
		} else if (key === "ArrowRight") {
			this.#key_RIGHT = true;
		}

		if (!this.#looping && this.#anyKeyDown()) {
			this.#runLoop();
		}
	}

	onKeyUp(key: string) {
		if (key === 'w' || key === 'W') {
			this.#key_W = false;
		} else if (key === 'a' || key === 'A') {
			this.#key_A = false;
		} else if (key === 's' || key === 'S') {
			this.#key_S = false;
		} else if (key === 'd' || key === 'D') {
			this.#key_D = false;
		} else if (key === 'q' || key === 'Q') {
			this.#key_Q = false;
		} else if (key === 'e' || key === 'E') {
			this.#key_E = false;
		}
		else if (key === "ArrowUp") {
			this.#key_UP = false;
		} else if (key === "ArrowDown") {
			this.#key_DOWN = false;
		} else if (key === "ArrowLeft") {
			this.#key_LEFT = false;
		} else if (key === "ArrowRight") {
			this.#key_RIGHT = false;
		}
	}

	#runLoop() {

		let prevTime = 0;
		let ctrl = this;
		this.#looping = true;

		const loopFn = function(time: number) {
			if (prevTime === 0) { // first frame
				prevTime = time;
				// start
				// ...
			}
			let dt = (time - prevTime) / 1000;

			// update
			const translateSpeed = 400;
			const rotateSpeed = 0.5;

			// translation
			if (ctrl.#key_W) {
				ctrl.#cameraOffsetZ -= dt * translateSpeed;
			}
			if (ctrl.#key_S) {
				ctrl.#cameraOffsetZ += dt * translateSpeed;
			}
			if (ctrl.#key_A) {
				ctrl.#cameraOffsetX -= dt * translateSpeed;
			}
			if (ctrl.#key_D) {
				ctrl.#cameraOffsetX += dt * translateSpeed;
			}
			if (ctrl.#key_Q) {
				ctrl.#cameraOffsetY -= dt * translateSpeed;
			}
			if (ctrl.#key_E) {
				ctrl.#cameraOffsetY += dt * translateSpeed;
			}

			// rotation
			if (ctrl.#key_UP) {
				ctrl.#rotateXRad -= dt * rotateSpeed;
			}
			if (ctrl.#key_LEFT) {
				ctrl.#rotateYRad += dt * rotateSpeed;
			}
			if (ctrl.#key_DOWN) {
				ctrl.#rotateXRad += dt * rotateSpeed;
			}
			if (ctrl.#key_RIGHT) {
				ctrl.#rotateYRad -= dt * rotateSpeed;
			}

			// update display
			setProjectionParams({
				cameraOffsetX: ctrl.#cameraOffsetX,
				cameraOffsetY: ctrl.#cameraOffsetY,
				cameraOffsetZ: ctrl.#cameraOffsetZ,
				rotateX: ctrl.#rotateXRad,
				rotateY: ctrl.#rotateYRad
			});

			// end of frame
			prevTime = time;
			if (ctrl.#anyKeyDown()) {
				requestAnimationFrame(loopFn);
			} else {
				ctrl.#looping = false;
			}
		}
		requestAnimationFrame(loopFn);
	}
}

export const controller = new Controller();