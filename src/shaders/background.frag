#version 300 es
precision highp float;

uniform vec2 u_resolution;

out vec4 fragColor;

float gaussian(float x, float sigma) {
    float z = x / sigma;
    return exp(-0.5 * z * z);
}

const float GRID_SIZE = 64.0;
const float LEFT_PORTION = 0.36;

float f(int x) { return float(x); }
int i(float x) { return int(x); }

float strengthForCell(int cellX, int cellY_fromBottom, int gridCountY) {
    // Mirrors:
    // contentStartGridIdx = floor(width*0.36/64)*gridY
    // easeInGridCount = floor(gridY * 2.7)
    // easeInGridEnd = contentStartGridIdx + gridY - 5
    int contentStartGridIdx = i((u_resolution.x * LEFT_PORTION) / GRID_SIZE) * gridCountY;
    int easeInGridCount = i(f(gridCountY) * 2.7);
    int easeInGridEnd = contentStartGridIdx + gridCountY - 5;

    int gridIdx = cellX * gridCountY + cellY_fromBottom;

    float num = f(gridIdx + easeInGridCount - easeInGridEnd);
    float denom = f(easeInGridCount);
    float strength = 1.0 - num / denom;

    // jitter = gridIdx % 2 == 0 ? 1/(easeInGridCount-3) : 0;
    float even = gridIdx - gridIdx / 2 * 2 == 0 ? 1.0 : 0.0;
    float jitter = even * (1.0 / max(1.0, (f(easeInGridCount) - 3.0)));
    strength += jitter;

    return clamp(strength, 0.0, 1.0);
}

void main() {
    vec2 p = vec2(floor(gl_FragCoord.x), u_resolution.y - floor(gl_FragCoord.y)); // pixel coords (matches u_resolution units)

    int gridSize = 64;
    int subGridCount = 8;
    float subSize = f(gridSize / subGridCount); // 8

    int gridCountX = int(ceil(u_resolution.x / f(gridSize)));
    int gridCountY = int(ceil(u_resolution.y / f(gridSize)));

    // Our base cell indices:
    // X increases to the right.
    // Y is indexed from the bottom (to match your TS), with drawing origin at:
    //   originY = height - (Y+1)*gridSize
    int baseCellX = i(p.x) / gridSize; // in frag coords
    int baseCellY = i(u_resolution.y - 1.0 - p.y) / gridSize;

    float gAccum = 0.0;
    bool hasContribution = false;

    // Because circles can spill outside their 64x64 cell (radius up to 16),
    // include neighbor cells in a 3x3 around the pixel.
    for (int oy = -1; oy <= 1; oy++) {
        for (int ox = -1; ox <= 1; ox++) {
            int cellX = baseCellX + ox;
            int cellY = baseCellY + oy;

            // bounds check (skip off-grid)
            if (cellX < 0 || cellX >= gridCountX || cellY < 0 || cellY >= gridCountY) continue;

            #if 0
            if (oy != 0 || ox != 0) continue;
            #endif

            float strength = strengthForCell(cellX, cellY, gridCountY);

            // Cell origin in screen pixel coords (top-left origin), matching your call:
            // drawSquareWithErosion(p5, X*64, height - (Y+1)*64, strength)
            vec2 cellOrigin = vec2(
                f(cellX * gridSize),
                u_resolution.y - f((cellY + 1) * gridSize)
            );

            // Iterate subcells (8x8) and add contributions for the "odd parity" ones.
            for (int sy = 0; sy < 8; sy++) {
                for (int sx = 0; sx < 8; sx++) {
                    int parity = sx + sy - 2 * ((sx + sy) / 2);
                    if (parity == 0) continue; // only (sx+sy)%2==1

                    vec2 center = cellOrigin + vec2(float(sx) + 0.5, float(sy) + 0.5) * subSize;

                    // radius = floor(subSize * erosion * 2)
                    float radius = floor(subSize * strength * 2.0);
                    vec2 centerToP = p - center;
                    float d = length(centerToP);

                    if (radius < 1.0 || abs(centerToP.x) >= radius || abs(centerToP.y) >= radius) {
                        // continue;
                    } else {
                        float normalizedDist = 1.0 - min(1.0, d / radius);
                        gAccum += normalizedDist * 255.0;
                        if (!hasContribution) hasContribution = true;
                    }

                }
            }
        }
    }

    #if 1
    // Base color from TS:
    // r=15, g=prev_g + contribs, b=112
    float r = hasContribution ? 31.0 : 0.0;
    float g = gAccum;
    float b = hasContribution ? 96.0 : 0.0;
    #else
    float r = 0.0;
    float g = 0.0;
    float b = 0.0;
    #endif

    // Overflow rule (TS):
    // overflow if (r-127)+(g-127)+(b-127) > 0  -> g > 254
    // if overflow: rgb = 255
    #if 1
    if (g > 254.0) {
        r = 255.0;
        g = 255.0;
        b = 255.0;
    }
    #endif

    #if 1 // right edge
    vec2 dp = u_resolution - p;
    ivec2 idp = ivec2(int(dp.x), int(dp.y)) - ivec2(1);

    if (idp.x < 16) {
        // base color for <12
        bool base = idp.x < 12;
        if (base) {
            r = 0.0; g = 224.0; b = 127.0;
        }

        ivec2 idp4 = idp / 4;
        int idx = idp4.x + idp4.y;

        bool magenta =
            (idp.x >= 12 && (idx % 5) > 1) ||
            (idp.x >= 8  && idp.x < 12 && (idx & 1) == 1);

        if (magenta) {
            r = 192.0; g = 0.0; b = 127.0;
        }
    }
    #endif

    // Bloom (TS):
    // center = (-w*0.54, h*0.8), sigma = w*0.36
    // distributed = gaussian(dist, 0, sigma)
    // dst.rgb += bloomColor * 1000 * distributed
    vec2 bloomCenter = vec2(-u_resolution.x * 0.54, u_resolution.y * 0.8);
    float sigma = u_resolution.x * 0.36;
    float distToCenter = length(p - bloomCenter);
    float distributed = gaussian(distToCenter, sigma);

    vec3 bloomColor = vec3(0.6, 0.5, 1.2);
    #if 1

    vec3 rgb255 = vec3(r, g, b);

    #if 1 // bloom?
    rgb255 += bloomColor * (1300.0 * distributed);
    #endif

    #if 0 // overflow here?
    if (rgb255.g >= 255.0) {
        rgb255 = vec3(255.0, 255.0, 255.0);
    }
    #endif

    rgb255 = clamp(rgb255, 0.0, 255.0);
    fragColor = vec4(rgb255 / 255.0, 1.0);

    #else

    vec3 rgb = vec3(strengthForCell(baseCellX, baseCellY, gridCountY));

    // this works:
    //gl_FragColor = vec4(float(baseCellX) / float(gridCountX), float(baseCellY) / float(gridCountY), 0.0, 1.0);

    fragColor = vec4(rgb, 1.0);

    #endif

}
