precision highp float;
varying vec2 vUv;
uniform vec2 uViewport,uPosition,uMediaSize,uNextSize,uExtent;
uniform vec3 uColor;
uniform float uOpacity,uRadius,uArc,uRotation,uLogoAngle,uMix;
uniform bool uHasMedia;
uniform int uFit;
void main(){
    vec2 point=(vUv-.5)*vec2(uViewport.x/uViewport.y,1.)-uPosition;
    float distance=length(point);
    float a=(1.-smoothstep(uRadius-1./uViewport.y,uRadius+1./uViewport.y,distance))*uOpacity;
    float angle=mod(degrees(atan(-point.y,point.x))-uRotation+720.,360.);
    if(angle>uArc)a=0.;
    vec3 color=uColor;
    gl_FragColor=vec4(color*a,a);
}
