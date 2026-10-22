precision highp float;
varying vec2 vUv;
uniform vec2 uViewport,uPosition,uMediaSize,uNextSize,uExtent;
uniform vec3 uColor;
uniform float uOpacity,uRadius,uArc,uRotation,uLogoAngle,uMix;
uniform bool uHasMedia;
uniform int uFit;
uniform sampler2D uImage,uNext;
vec4 picture(sampler2D image,vec2 uv,vec2 target,vec2 size,int fit){
    vec2 ratio=target/max(size,vec2(1.));
    float scale=fit==0?max(ratio.x,ratio.y):fit==1?min(ratio.x,ratio.y):1.;
    vec2 q=(uv-.5)*target/(max(size,vec2(1.))*scale)+.5;
    float visible=step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.);
    return texture2D(image,clamp(q,0.,1.))*visible;
}
void main(){
    vec2 target=uExtent*uViewport.y;
    vec2 center=vec2(.5)+uPosition/vec2(uViewport.x/uViewport.y,1.);
    vec2 uv=(vUv-center)*uViewport/target+.5;
    float inBox=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
    vec4 value=uHasMedia?picture(uImage,uv,target,uMediaSize,uFit):vec4(0.);
    float a=value.a*uOpacity*inBox;
    gl_FragColor=vec4(value.rgb*a,a);
}
