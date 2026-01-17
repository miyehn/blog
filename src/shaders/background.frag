#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float t = 0.0;

    // simple animated gradient
    vec3 col = vec3(uv, sin(u_time * 2.0) * 0.3 + 0.3);
    gl_FragColor = vec4(col, 1.0);
}
