"use client"

import { useId, useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import useSilenceAwareRecorder from "silence-aware-recorder/react";
import useMediaRecorder from "@wmik/use-media-recorder";
import mergeImages from "merge-images";

const INTERVAL = 250;
const IMAGE_WIDTH = 512;
const IMAGE_QUALITY = 0.6;
const COLUMNS = 4;
const MAX_SCREENSHOTS = 60;
const SILENCE_DURATION = 2500;
const SILENT_THRESHOLD = -30;

export default function Chat() {
    const id = useId();
    const maxVolumeRef = useRef(0);
    const minVolumeRef = useRef(-100);
    const isBusy = useRef(false);
    const screenshotsRef = useRef([]);
    const videoRef = useRef();
    const canvasRef = useRef();
    const [displayDebug, setDisplayDebug] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [phase, setPhase] = useState("not inited");
    const [transcription, setTranscription] = useState("");
    const [imagesGridUrl, setImagesGridUrl] = useState(null);
    const [currentVolume, setCurrentVolume] = useState(-50);
    const [volumePercentage, setVolumePercentage] = useState(0);

    let { liveStream, ...video } = useMediaRecorder({
        recordScreen: false,
        blobOptions: { type: "video/webm" },
        mediaStreamConstaints: { audio: false, video: true},
    });

    const audio = useSilenceAwareRecorder({
        onDataAvailable: onSpeech,
        onVolumeChange: setCurrentVolume,
        silenceDuration: SILENCE_DURATION,
        silentThreshold: SILENT_THRESHOLD,
        minDecibels: -100,
    });

    function startRecording() {
        audio.startRecording();
        video.startRecording();

        setIsStarted(true);
        setPhase("user: waiting for speech");
    }

    function stopRecording() {
        document.location.reload();
    }

    async function onSpeech(data) {
        if (isBusy.current) return;
        
        isBusy.current = true;
        audio.stopRecording();
    }

    useEffect(() => {
        if (videoRef.current && liveStream && !videoRef.current.srcObject) {
            videoRef.current.srcObject = liveStream;
        }
    }, [liveStream]);

    useEffect(() => {
        if (!audio.isRecording) {
            setVolumePercentage(0);
            return;
        }

        if (typeof currentVolume === "number" && isFinite(currentVolume)) {
            if (currentVolume > maxVolumeRef.current)
                maxVolumeRef.current = currentVolume;
            if (currentVolume < minVolumeRef.current)
                minVolumeRef.current = currentVolume;

            if (maxVolumeRef.current !== minVolumeRef.current) {
                setVolumePercentage(
                    (currentVolume - minVolumeRef.current) / 
                    (maxVolumeRef.current - minVolumeRef.current)
                );
            }
        }
    }, [currentVolume], audio.isRecording);

    return (
        <>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div className="antialiased w-screen h-screen p-4 flex flex-col justify-center items-center bg-black">
                <div className="w-full h-full sm:container sm:h-auto grid grid-rows-[auto_1fr] grid-cols-[1fr] sm:grid-cols-[2fr_1fr] sm:grid-rows-[1fr] justify-content-center bg-black">
                    <div className="relative">
                        <video 
                            ref={videoRef} 
                            className="h-auto w-full aspect-[4/3] object-cover rounded-[1rem] bg-gray-900"
                            autoPlay
                        />
                        {audio.isRecording ? (
                        <div className="w-16 h-16 absolute bottom-4 left-4 flex justify-center items-center">
                            <div
                            className="w-16 h-16 bg-red-500 opacity-50 rounded-full"
                            style={{
                                transform: `scale(${Math.pow(volumePercentage, 4).toFixed(
                                4
                                )})`,
                            }}
                            ></div>
                        </div>
                        ) : (
                            <div className="w-16 h-16 absolute bottom-4 left-4 flex justify-center items-center cursor-pointer">
                                <div className="text-5xl text-red-500 opacity-50">❚❚</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap justify-center p-4 opacity-50 gap-2">
                {isStarted ? (
                    <button 
                        className="px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50"
                        onClick={stopRecording}
                    >
                        Stop session
                        </button>
                    ) : (
                        <button
                            className="px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50"
                            onClick={startRecording}
                        >
                            Start session
                        </button>
                    )}  
            </div>
        </>
    );
}