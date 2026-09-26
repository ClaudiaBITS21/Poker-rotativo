import json,subprocess,re
FF='../pyff/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
m=json.load(open('marks.json'));mk={x['key']:x['t'] for x in m['marks']};DUR=json.load(open('dur.json'))
INTRO,BREAK,OUTRO=6.5,4.5,6.0
tb=mk['reloj']-0.1;T=m['total'];total=INTRO+T+BREAK+OUTRO
# 1) lista de cuadros con intro, pausa y cierre
lines=open('frames.txt').read().split('\n');items=[]
for i in range(0,len(lines)-1,2):
    items.append([re.search(r"'(.*)'",lines[i]).group(1),float(lines[i+1].split()[1])])
out=[];t=0;inserted=False
out.append([items[0][0],INTRO])
for f,d in items:
    if not inserted and t+d>tb:
        out.append([f,BREAK]);inserted=True
    out.append([f,d]);t+=d
out.append([items[-1][0],OUTRO])
open('frames2.txt','w').write('\n'.join(f"file '{f}'\nduration {d:.4f}" for f,d in out)+f"\nfile '{items[-1][0]}'\n")
# 2) voz desplazada: intro antes, pausa en tb
subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-i','voz.wav','-filter_complex',
 f"[0:a]asplit=2[a][b];[a]atrim=0:{tb:.3f},asetpts=PTS-STARTPTS,adelay={int(INTRO*1000)}:all=1,apad=pad_dur={BREAK}[x];[b]atrim={tb:.3f},asetpts=PTS-STARTPTS,apad=pad_dur={OUTRO}[y];[x][y]concat=n=2:v=0:a=1,aresample=48000,aformat=channel_layouts=stereo[o]",
 '-map','[o]','voz2.wav'],check=True)
# 3) música con volumen por tramos
vend=INTRO+BREAK+mk['fin']+0.3+DUR['fin'];LO=0.11
pts=[(0,0.85),(INTRO-1.0,0.85),(INTRO+0.2,LO),(INTRO+tb,LO),(INTRO+tb+0.8,0.7),(INTRO+tb+BREAK-1.0,0.7),(INTRO+tb+BREAK+0.2,LO),
     (INTRO+BREAK+mk['fin']-0.2,LO),(INTRO+BREAK+mk['fin']+0.5,0.3),(vend,0.3),(vend+0.8,0.85),(total-3.0,0.85),(total,0)]
expr='0'
for (t0,v0),(t1,v1) in reversed(list(zip(pts,pts[1:]))):
    expr=f"if(between(t,{t0:.3f},{t1:.3f}),{v0}+({v1}-{v0})*(t-{t0:.3f})/{max(t1-t0,0.001):.3f},{expr})"
subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-i','voz2.wav','-i','song_loop.wav','-filter_complex',
 f"[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{total:.3f},volume='{expr}':eval=frame[m];[0:a][m]amix=inputs=2:normalize=0:duration=longest,atrim=0:{total:.3f},alimiter=limit=0.95[o]",
 '-map','[o]','mezcla.wav'],check=True)
# 4) video final
subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i','frames2.txt','-i','mezcla.wav',
 '-vf','fps=30,scale=780:1688:force_original_aspect_ratio=decrease:flags=lanczos,pad=780:1688:(ow-iw)/2:(oh-ih)/2:color=0x093A26,format=yuv420p',
 '-c:v','libx264','-preset','slow','-crf','23','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart','liga-poker-tutorial-musica.mp4'],check=True)
print('total',round(total,1),'pausa',round(INTRO+tb,1),'fin voz',round(vend,1))
