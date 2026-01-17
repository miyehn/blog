declare module "glslCanvas" {
	export default class GlslCanvas {
		gl?: WebGLRenderingContext;
		constructor(canvas: HTMLCanvasElement, options?: any);
		load(source: string): void;
		setUniform(name: string, value: any): void;
	}
}