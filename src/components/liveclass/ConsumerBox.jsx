import "./ConsumerBox.css";
import { useEffect, useRef, useState } from "react";

const ConsumerBox = ({ socket, device, videoProducerId,audioProducerId ,roomId }) => {
  const videoRef = useRef(null);
  const [isStream, setIsStream] = useState(false);
  const [videoTransport, setVideoTransport] = useState(null);
  const [audioTransport, setAudioTransport] = useState(null);
  const [videoConsumer, setVideoConsumer] = useState(null);
  const [audioConsumer, setAudioConsumer] = useState(null);

  useEffect(() => {
    if (!socket || !device || !producerId || !roomId) return;

    let transport = null;
    let activeConsumer = null;

    const consumers = []

    const createConsumeTransport = (roomId) => {
      return new Promise((resolve, reject) => {
        socket.emit(
          "createTransport",
          { roomId: roomId, sender: false },
          ({ params }) => {
            if (params?.error) return reject(params.error);

            transport = device.createRecvTransport(params);
            // setConsumerTransport(transport);

            transport.on("connect", ({ dtlsParameters }, callback, errback) => {
              if (transport._connectionState === "connected") {
                console.warn("Consumer transport already connected");
                return;
              }
              socket.emit(
                "connectConsumerTransport",
                { roomId, dtlsParameters },
                ({ success, error }) => {
                  if (error) {
                    console.error("Transport connect failed:", error);
                    errback(error);
                  } else {
                    callback();
                  }
                }
              );
            });

            transport.on("connectionstatechange", (state) => {
              if (state === "failed" || state === "closed") {
                console.warn("Consumer transport closed or failed.");
                transport.close();
              }
            });

            resolve(transport);
          }
        );
      });
    };

    const consumeMedia = async(producerId,type) => {
      const recvTransport = await createConsumeTransport(roomId);
      if (type === "video") setVideoTransport(recvTransport);
      else if (type === "audio") setAudioTransport(recvTransport);
      return new Promise((resolve, reject) => {
        socket.emit(
          "consumeMedia",
          {
            roomId,
            rtpCapabilities: device.rtpCapabilities,
            producerId,
          },
          async ({ params }) => {
            if (!params || params.error) {
              const errMsg = params?.error || "Error during media consumption";
              return reject(new Error(errMsg));
            }

            try {
              const _consumer = await recvTransport.consume({
                id: params.id,
                producerId: params.producerId,
                kind: params.kind,
                rtpParameters: params.rtpParameters,
              });

              if (type === "video") {
                setVideoConsumer(_consumer);
              } else {
                setAudioConsumer(_consumer);
              }

              activeConsumer = _consumer;

              const stream = new MediaStream([_consumer.track]);
              resolve([{ consumer, stream }]);
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    };

    const setup = async () => {
      try {
        setIsStream(true);
        if (videoProducerId) {
          const { stream: videoStream } = await consumeMedia(videoProducerId, "video");
          if (videoRef.current) {
            videoRef.current.srcObject = videoStream;
            videoRef.current.play().catch((err) => console.warn("Video autoplay failed", err));
          }
        }
  
        if (audioProducerId) {
          const { stream: audioStream } = await consumeMedia(audioProducerId, "audio");
          if (audioRef.current) {
            audioRef.current.srcObject = audioStream;
            audioRef.current.play().catch((err) => console.warn("Audio autoplay failed", err));
          }
        }

        if (videoProducerId) {
          socket.emit("resumePausedConsumers", { roomId, producerId: videoProducerId }, ({ success }) => {
            console.log(
              success ? "Video Consumer resumed" : "Failed to resume consumer"
            );
          } );
        }
        if (audioProducerId) {
          socket.emit("resumePausedConsumers", { roomId, producerId: audioProducerId }, ({ success }) => {
            console.log(
              success ? "Audio Consumer resumed" : "Failed to resume consumer"
            );
          } );
        }
  
      } catch (err) {
        console.error("Error setting up consumer:", err);
      }
    };

    setup();

    return () => {
      console.log("Cleaning up consumer for producer:", producerId);

      [videoConsumer, audioConsumer].forEach((c) => c?.close?.());
    [videoTransport, audioTransport].forEach((t) => t?.close?.());

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }

    if (audioRef.current?.srcObject) {
      audioRef.current.srcObject.getTracks().forEach((t) => t.stop());
      audioRef.current.srcObject = null;
    }
    };
  }, [socket, device, videoProducerId,audioProducerId]);

  return (
    <div className="main-consumer-box">
      <div className="video-box">
        {isStream ? (
          <>
          {videoProducerId && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="cons-video"
            />
          )}
          {audioProducerId && (
            <audio
              ref={audioRef}
              autoPlay
              playsInline
              controls={false}
            />
          )}
          </>

        ) : (
          <div className="user-tag">
            <p>"S1"</p>
          </div>
        )}
        <span className="user-label">{videoProducerId || audioProducerId}</span>
      </div>
    </div>
  );
};

export default ConsumerBox;
