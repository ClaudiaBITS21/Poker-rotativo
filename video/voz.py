import sys, wave, numpy as np, sherpa_onnx
D='voz/vits-piper-es_AR-daniela-high/'
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=D+'es_AR-daniela-high.onnx',tokens=D+'tokens.txt',data_dir=D+'espeak-ng-data'),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg)
def say(text,out,speed=1.0):
    a=tts.generate(text,sid=0,speed=speed)
    s=np.clip(np.array(a.samples),-1,1);pcm=(s*32767).astype(np.int16)
    with wave.open(out,'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(a.sample_rate);w.writeframes(pcm.tobytes())
    return len(pcm)/a.sample_rate
if __name__=='__main__':
    print(say(sys.argv[1],sys.argv[2]))
