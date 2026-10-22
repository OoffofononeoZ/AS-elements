precision highp float;
varying vec4 vInk;
varying vec2 vEdge;
uniform int uRound;
void main(){
    float d=uRound==1?length(vEdge):abs(vEdge.x);
    float boundary=uRound==1?1.:vEdge.y;
    float aa=max(fwidth(d)*.5,.000001);
    float a=vInk.a*(1.-smoothstep(boundary-aa,boundary+aa,d));
    gl_FragColor=vec4(vInk.rgb*a,a);
}
