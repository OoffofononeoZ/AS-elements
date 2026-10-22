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
    vec2 point=(vUv-.5)*vec2(uViewport.x/uViewport.y,1.)-uPosition;
    float distance=length(point);
    float a=(1.-smoothstep(uRadius-1./uViewport.y,uRadius+1./uViewport.y,distance))*uOpacity;
    float angle=mod(degrees(atan(-point.y,point.x))-uRotation+720.,360.);
    if(angle>uArc)a=0.;
    vec3 color=uColor;
    if(uHasMedia){
        float co=cos(uLogoAngle),si=sin(uLogoAngle);
        vec2 q=mat2(co,-si,si,co)*point/(2.*max(uRadius,.000001))+.5;
        vec4 image=picture(uImage,q,vec2(2.*uRadius*uViewport.y),uMediaSize,uFit);
        color=image.rgb;
        a*=image.a;
    }
    gl_FragColor=vec4(color*a,a);
}
