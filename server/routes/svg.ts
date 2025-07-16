export default defineEventHandler((event) => {
  const { text, width, height } = getQuery(event);

  // Configura os cabeçalhos CORS para permitir acesso de qualquer origem
  event.node.res.setHeader('Access-Control-Allow-Origin', '*');
  event.node.res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  event.node.res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  event.node.res.setHeader('Content-Type', 'image/svg+xml');

  // Define valores padrão se a largura ou altura não forem fornecidas
  const defaultWidth = 199;
  const defaultHeight = 48;
  const svgWidth = parseFloat(
    typeof width === "string"
      ? width
      : typeof width === "number"
      ? width.toString()
      : defaultWidth.toString()
  );
  const svgHeight = parseFloat(
    typeof height === "string"
      ? height
      : typeof height === "number"
      ? height.toString()
      : defaultHeight.toString()
  );

  // Define um raio de arredondamento mais natural.
  // Usamos 25% da menor dimensão para um arredondamento visível e proporcional.
  const naturalRadius = Math.min(svgWidth, svgHeight) * 0.25;
  // Constante para aproximar um círculo com curvas de Bézier cúbicas
  const k = 0.552284749831356;

  // --- Caminho Dinâmico para a forma externa (usado em clipPath) ---
  // A sintaxe do caminho SVG para um retângulo arredondado é:
  // M (move to) top-left corner of the straight segment
  // H (horizontal line to) top-right straight segment
  // C (cubic bezier curve) to top-right rounded corner
  // V (vertical line to) bottom-right straight segment
  // C (cubic bezier curve) to bottom-right rounded corner
  // H (horizontal line to) bottom-left straight segment
  // C (cubic bezier curve) to bottom-left rounded corner
  // V (vertical line to) top-left straight segment
  // C (cubic bezier curve) to top-left rounded corner
  // Z (close path)
  const clipPathD = `
    M ${naturalRadius}, 0
    H ${svgWidth - naturalRadius}
    C ${svgWidth - naturalRadius + k * naturalRadius}, 0, ${svgWidth}, ${k * naturalRadius}, ${svgWidth}, ${naturalRadius}
    V ${svgHeight - naturalRadius}
    C ${svgWidth}, ${svgHeight - naturalRadius + k * naturalRadius}, ${svgWidth - k * naturalRadius}, ${svgHeight}, ${svgWidth - naturalRadius}, ${svgHeight}
    H ${naturalRadius}
    C ${k * naturalRadius}, ${svgHeight}, 0, ${svgHeight - k * naturalRadius}, 0, ${svgHeight - naturalRadius}
    V ${naturalRadius}
    C 0, ${k * naturalRadius}, ${k * naturalRadius}, 0, ${naturalRadius}, 0
    Z
  `;

  // --- Caminho Dinâmico para o traçado (stroke) ---
  // Este caminho precisa estar ligeiramente dentro do clipPath.
  // A largura original do traçado é 1.4, então vamos compensar por metade disso.
  const strokeOffset = 1.4 / 2; // Metade da largura do traçado
  const strokeRadius = naturalRadius - strokeOffset; // Ajusta o raio para o caminho do traçado

  const strokePathD = `
    M ${strokeRadius}, ${strokeOffset}
    H ${svgWidth - strokeRadius}
    C ${svgWidth - strokeRadius + k * strokeRadius}, ${strokeOffset}, ${svgWidth - strokeOffset}, ${k * strokeRadius}, ${svgWidth - strokeOffset}, ${strokeRadius}
    V ${svgHeight - strokeRadius}
    C ${svgWidth - strokeOffset}, ${svgHeight - strokeRadius + k * strokeRadius}, ${svgWidth - k * strokeRadius}, ${svgHeight - strokeOffset}, ${svgWidth - strokeRadius}, ${svgHeight - strokeOffset}
    H ${strokeRadius}
    C ${k * strokeRadius}, ${svgHeight - strokeOffset}, ${strokeOffset}, ${svgHeight - k * strokeRadius}, ${strokeOffset}, ${svgHeight - strokeRadius}
    V ${strokeRadius}
    C ${strokeOffset}, ${k * strokeRadius}, ${k * strokeRadius}, ${strokeOffset}, ${strokeRadius}, ${strokeOffset}
    Z
  `;

  const svgContent = `
<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
<foreignObject x="-100" y="-100" width="${svgWidth + 200}" height="${svgHeight + 200}"><div xmlns="http://www.w3.org/1999/xhtml" style="backdrop-filter:blur(50px);clip-path:url(#bgblur_1_7_142_clip_path);height:100%;width:100%"></div></foreignObject><g data-figma-bg-blur-radius="100">
<g clip-path="url(#clip0_7_142)">
<path d="${clipPathD.trim()}" fill="white" fill-opacity="0.01" style="mix-blend-mode:luminosity"/>
<foreignObject x="-32" y="-32" width="${svgWidth + 64}" height="${svgHeight + 64}"><div xmlns="http://www.w3.org/1999/xhtml" style="backdrop-filter:blur(2px);clip-path:url(#bgblur_2_7_142_clip_path);height:100%;width:100%"></div></foreignObject><g filter="url(#filter1_gf_7_142)" data-figma-bg-blur-radius="4">
<rect width="${svgWidth}" height="${svgHeight}" fill="#F4F4F4" fill-opacity="0.01"/>
</g>
<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="18" fill="white" font-family="Montserrat, sans-serif">
    ${text || "Void"}
  </text>
</g>
<path d="${strokePathD.trim()}" stroke="url(#paint0_linear_7_142)" stroke-width="1.4"/>
</g>
<defs>
<clipPath id="bgblur_1_7_142_clip_path" transform="translate(100 100)"><path d="${clipPathD.trim()}"/></clipPath><filter id="filter1_gf_7_142" x="-32" y="-32" width="${svgWidth + 64}" height="${svgHeight + 64}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feTurbulence type="fractalNoise" baseFrequency="0.011363636702299118 0.011363636702299118" numOctaves="3" seed="7199" result="displacementX" />
<feTurbulence type="fractalNoise" baseFrequency="0.011363636702299118 0.011363636702299118" numOctaves="3" seed="7200" result="displacementY" />
<feColorMatrix in="displacementX" type="matrix" values="0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1" result="displacementXRed" />
<feColorMatrix in="displacementY" type="matrix" values="0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 1" />
<feComposite in="displacementXRed" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
<feDisplacementMap in="shape" scale="64" xChannelSelector="R" yChannelSelector="G" width="100%" height="100%" />
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
<feComponentTransfer result="sourceDisplacedAlpha">
<feFuncA type="gamma" exponent="0.2" />
</feComponentTransfer>
<feColorMatrix in="shape" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
<feComponentTransfer result="inputSourceAlpha">
<feFuncA type="gamma" exponent="0.2" />
</feComponentTransfer>
<feComposite in="sourceDisplacedAlpha" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="displacementAlphasMultiplied"/>
<feComposite in="displacementAlphasMultiplied" operator="arithmetic" k1="0" k2="0" k3="-0.5" k4="0.5" result="centeringAdjustment"/>
<feComposite in="displacementX" in2="displacementAlphasMultiplied" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" />
<feComposite in="centeringAdjustment" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
<feColorMatrix type="matrix" values="0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1" result="displacementXFinal" />
<feComposite in="displacementY" in2="displacementAlphasMultiplied" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" />
<feComposite in="centeringAdjustment" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 1" result="displacementYFinal" />
<feComposite in="displacementXFinal" in2="displacementYFinal" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
<feComposite in2="displacementAlphasMultiplied" operator="in" result="displacementMap" />
<feFlood flood-color="rgb(127, 127, 127)" flood-opacity="1"/>
<feComposite in2="displacementAlphasMultiplied" operator="out" />
<feComposite in2="displacementMap" operator="over" result="displacementMapWithBg"/>
<feDisplacementMap in="shape" scale="64" xChannelSelector="R" yChannelSelector="G" width="100%" height="100%" result="displacedImage" />
<feColorMatrix in="shape" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 127 0" result="imageOpaque" />
<feDisplacementMap in="imageOpaque" in2="displacementMapWithBg" scale="64" xChannelSelector="R" yChannelSelector="G" width="100%" height="100%" result="displacedImageOpaque" />
<feColorMatrix in="displacedImage" type="matrix" values="0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="displacedImageRed" />
<feColorMatrix in="shape" type="matrix" values="0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
<feComposite in="displacedImageRed" operator="atop" result="transparencyRedMap"/>
<feColorMatrix in="transparencyRedMap" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" result="transparencyAlphaMap" />
<feComposite in="displacedImageOpaque" in2="imageOpaque" operator="over" />
<feComposite in2="transparencyAlphaMap" operator="in" result="effect1_texture_7_142"/>
<feGaussianBlur stdDeviation="2" result="effect2_foregroundBlur_7_142"/>
</filter>
<clipPath id="bgblur_2_7_142_clip_path" transform="translate(32 32)"><rect width="${svgWidth}" height="${svgHeight}"/></clipPath><linearGradient id="paint0_linear_7_142" x1="-64.3824" y1="4.2439" x2="-63.1314" y2="52.2285" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0.4"/>
<stop offset="0.368352" stop-color="white" stop-opacity="0.01"/>
<stop offset="0.574372" stop-color="white" stop-opacity="0.01"/>
<stop offset="1" stop-color="white" stop-opacity="0.1"/>
</linearGradient>
<clipPath id="clip0_7_142">
<path d="${clipPathD.trim()}" fill="white"/>
</clipPath>
</defs>
</svg>
  `;

  return svgContent;
});
