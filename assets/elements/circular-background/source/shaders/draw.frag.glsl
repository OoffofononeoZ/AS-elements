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
    vec4 value=vec4(uColor,1.);
    if(uHasMedia){
        vec4 a=picture(uImage,vUv,uViewport,uMediaSize,uFit),b=picture(uNext,vUv,uViewport,uNextSize,uFit);
        value=mix(a,b,uMix);
        value=vec4(value.rgb*value.a+uColor*(1.-value.a),1.);
    }
    gl_FragColor=value;
}
