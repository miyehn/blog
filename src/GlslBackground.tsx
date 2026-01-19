// ShaderCanvas.tsx
import React, { useEffect, useRef } from "react";
import Canvas, {type ICanvasOptions} from "glsl-canvas-js/dist/esm/canvas/canvas";
import FRAG_SHADER from "./shaders/background.frag?raw"

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
	const dpr = 1;//window.devicePixelRatio;

	// If you want it to cover the whole screen:
	const cssW = window.innerWidth;
	const cssH = window.innerHeight;

	// Set CSS size
	canvas.style.width = "100vw";
	canvas.style.height = "100vh";
	canvas.style.display = "block";

	// Set backing store size (device pixels)
	const w = Math.max(1, Math.floor(cssW * dpr));
	const h = Math.max(1, Math.floor(cssH * dpr));

	if (canvas.width !== w || canvas.height !== h) {
		canvas.width = w;
		canvas.height = h;
	}

	return { w, h, dpr };
}

export default function ShaderCanvas() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const sandboxRef = useRef<any>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Create shader sandbox once
		const options: ICanvasOptions = {
			depth: false,
			alpha: false,
		};
		const sandbox = new Canvas(canvas, options);
		sandbox.devicePixelRatio = 1;
		sandbox.load(FRAG_SHADER).then(success => {
			console.assert(success, "fragment shader load failed");
			sandbox.pause();
		});

		sandboxRef.current = sandbox;

		// Handle resize
		const handleResize = () => {
			// const { w, h } = resizeCanvasToDisplaySize(canvas);
			// u_resolution in pixels (match gl_FragCoord)
			// sandbox.setUniform("u_resolution", [w, h]);
		};
		handleResize();
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);

			// Best-effort WebGL cleanup
			try {
				const gl =
					(sandboxRef.current?.gl as WebGLRenderingContext | undefined) ??
					(canvas.getContext("webgl") as WebGLRenderingContext | null);

				gl?.getExtension("WEBGL_lose_context")?.loseContext();
			} catch {
				// ignore
			}

			sandboxRef.current = null;
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: "fixed",
				inset: 0,
				zIndex: -100,
				width: "100vw",
				height: "100vh",
			}}
		/>
	);
}