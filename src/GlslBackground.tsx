// ShaderCanvas.tsx
import React, { useEffect, useRef } from "react";
import GlslCanvas from "glslCanvas";

// Minimal fragment shader (Shadertoy-ish uniforms: u_time, u_resolution)
const FRAG = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
//uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = 0.0;

  // simple animated gradient
  vec3 col = vec3(0.1, 0.1, 0.1);
  gl_FragColor = vec4(col, 1.0);
}
`;

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
	const dpr = window.devicePixelRatio || 1;

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

	return { w, h };
}

export default function ShaderCanvas() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const sandboxRef = useRef<any>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Create shader sandbox once
		const sandbox = new GlslCanvas(canvas);
		sandboxRef.current = sandbox;

		// Load shader
		sandbox.load(FRAG);

		// Handle resize
		const handleResize = () => {
			const { w, h } = resizeCanvasToDisplaySize(canvas);
			// u_resolution in pixels (match gl_FragCoord)
			sandbox.setUniform("u_resolution", [w, h]);
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
				width: "100vw",
				height: "100vh",
			}}
		/>
	);
}