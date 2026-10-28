/* A deformable mesh articulates the provided portrait locally: hands, thumbs,
   breathing, and head movement. Desk and wall stay anchored. No global bobbing. */
(()=>{
const canvas=document.querySelector('#scene'), fallback=document.querySelector('#fallback');
const gl=canvas.getContext('webgl',{alpha:false,antialias:true,preserveDrawingBuffer:true});
let theme=document.documentElement.dataset.theme;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(!gl){canvas.hidden=true;fallback.hidden=false;const show=()=>fallback.src=`assets/${document.documentElement.dataset.theme}.png`;show();addEventListener('themechange',show);return}
const vertex=`
precision mediump float;
attribute vec2 a_position; varying vec2 v_uv; uniform float u_time; uniform float u_night; uniform float u_aspect; uniform float u_motion;
float field(vec2 uv,vec2 center,vec2 size){vec2 p=(uv-center)/size;return exp(-dot(p,p)*2.0);}
void main(){vec2 uv=a_position;v_uv=uv;vec2 d=vec2(0.);float t=u_time;float n=u_night;
// Wrists alternate while typing, thumbs and controller move at night.
vec2 lh=mix(vec2(.482,.516),vec2(.517,.488),n);vec2 rh=mix(vec2(.555,.491),vec2(.585,.477),n);
float left=field(uv,lh,vec2(.057,.042));float right=field(uv,rh,vec2(.046,.033));
float typing=sin(t*15.0)*.0038+sin(t*23.0)*.0015;
float gaming=sin(t*5.3)*.0045+sin(t*11.0)*.001;
d+=left*vec2(mix(sin(t*8.)*.0015,gaming*.6,n),mix(typing,gaming,n));
d+=right*vec2(mix(sin(t*9.)*.001,-gaming*.6,n),mix(sin(t*18.+1.)*.004,gaming*.5,n));
// A soft head turn, a little concentration, and breathing in the shoulders.
float head=field(uv,vec2(.705,.363),vec2(.11,.092));
d+=head*vec2(sin(t*.84)*.0032,(sin(t*1.25)+sin(t*.6))*.0017);
float hair=field(uv,vec2(.729,.509),vec2(.1,.12));d+=hair*vec2(sin(t*.84)*.0017,sin(t*1.2)*.0014);
float shoulders=field(uv,vec2(.664,.61),vec2(.14,.09));d.y+=shoulders*sin(t*1.7)*.0018;
float thumb=field(uv,vec2(.519,.473),vec2(.015,.018));d.y+=thumb*n*sin(t*13.)*.003;
uv+=d*u_motion;gl_Position=vec4((uv.x*2.-1.)*u_aspect,1.-uv.y*2.,0.,1.);
}`;
const fragment=`precision mediump float;varying vec2 v_uv;uniform sampler2D u_image;uniform float u_time;uniform float u_night;uniform float u_motion;
float side(vec2 a,vec2 b,vec2 p){return (b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);}
void main(){vec2 p=v_uv;vec3 col=texture2D(u_image,p).rgb;
vec2 a=mix(vec2(.357,.383),vec2(.335,.330),u_night),b=mix(vec2(.520,.344),vec2(.551,.287),u_night),c=mix(vec2(.553,.463),vec2(.583,.432),u_night),d=mix(vec2(.404,.491),vec2(.386,.467),u_night);
float inside=step(0.,side(a,b,p))*step(0.,side(b,c,p))*step(0.,side(c,d,p))*step(0.,side(d,a,p));
float light=sin(u_time*2.3+p.y*35.)*.035+sin(u_time*4.1)*.015;
col+=inside*u_motion*light*mix(vec3(.35,.4,.4),vec3(.3,.65,1.),u_night);
gl_FragColor=vec4(col,1.);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
const points=[],cols=140,rows=160;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){let l=x/cols,r=(x+1)/cols,t=y/rows,b=(y+1)/rows;points.push(l,t,r,t,l,b,r,t,r,b,l,b)}
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
const uniform={};['u_time','u_night','u_aspect','u_motion','u_image'].forEach(k=>uniform[k]=gl.getUniformLocation(program,k));gl.uniform1i(uniform.u_image,0);
const textures={};let available=false;let inView=true;new IntersectionObserver(entries=>{inView=entries[0].isIntersecting}).observe(canvas);
function load(name){const im=new Image();im.onload=()=>{const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);textures[name]={tx,aspect:(im.width/im.height)/(canvas.width/canvas.height)};if(name===theme)available=true;};im.onerror=()=>{canvas.hidden=true;fallback.hidden=false;fallback.src=`assets/${theme}.png`};im.src=`assets/${name}.png`;}load('day');load('night');
addEventListener('themechange',e=>{theme=e.detail;available=!!textures[theme];});
function render(ms){requestAnimationFrame(render);if(!inView||document.hidden||!available)return;const entry=textures[theme];const night=theme==='night'?1:0;gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(1-night,1-night,1-night,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.bindTexture(gl.TEXTURE_2D,entry.tx);gl.uniform1f(uniform.u_time,ms/1000);gl.uniform1f(uniform.u_night,night);gl.uniform1f(uniform.u_aspect,Math.min(1,entry.aspect));gl.uniform1f(uniform.u_motion,reduced.matches?0:1);gl.drawArrays(gl.TRIANGLES,0,points.length/2);canvas.dataset.animated=reduced.matches?'reduced':'true';}requestAnimationFrame(render);
})();
