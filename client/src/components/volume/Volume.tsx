import { FC, useCallback, useEffect, useRef, useState } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { VideoController } from "../controllers/video-controller";

interface Props {
  controller: VideoController | null;
  setShowControls?: (value: boolean) => void;
  isIOS?: boolean; // Thêm prop isIOS nếu cần thiết
}

// CSS tùy chỉnh cho slider
const sliderStyles = `
  .volume-slider {
    width: 60px;
    height: 4px;
    background: white;
    opacity: 1;
    border-radius: 2px;
    position: relative;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .volume-slider::-webkit-slider-runnable-track {
    height: 4px;
    background: linear-gradient(to right, white 0%, white var(--value), gray var(--value), gray 100%);
    background-size: 100% 4px;
    background-repeat: no-repeat;
    border-radius: 2px;
    opacity: 1; /* Đảm bảo track rõ ràng */
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
    margin-top: -3px;
  }

  .volume-slider::-moz-range-track {
    height: 4px;
    background: gray;
    opacity: 0.3;
  }

  .volume-slider::-moz-range-thumb {
    width: 10px.
    height: 10px;
    background: white;
    border: none;
    border-radius: 50%;
  }

  .volume-slider::-moz-range-progress {
    background: white;
    height: 4px;
  }

  .volume-slider:focus {
    outline: none;
  }
`;

// Thêm style vào document
const styleSheet = document.createElement("style");
styleSheet.innerText = sliderStyles;
document.head.appendChild(styleSheet);

export const Volume: FC<Props> = ({ controller, setShowControls, isIOS }) => {
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const previousVolume = useRef(100);

  useEffect(() => {
    if (controller) {
      const vol = controller.getVolume();
      setVolume(vol);
      setMuted(controller.isMuted());
      previousVolume.current = vol === 0 ? 50 : vol;
    }
  }, [controller]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseInt(event.target.value, 10);
      setVolume(newVolume); // Cập nhật UI tạm thời
    },
    []
  );

  const handleChangeCommitted = useCallback(
    (
      event:
        | React.MouseEvent<HTMLInputElement>
        | React.TouchEvent<HTMLInputElement>
    ) => {
      if (!controller) return;
      const newVolume = parseInt((event.target as HTMLInputElement).value, 10);
      console.log(newVolume, "newVolume in handleChangeCommitted");
      controller.unmute();
      controller.updateVolume(newVolume);
      setVolume(newVolume);
      setMuted(newVolume === 0);
      if (newVolume > 0) previousVolume.current = newVolume;
      if (setShowControls) setShowControls(true);
    },
    [controller, setShowControls]
  );

  const toggleMute = useCallback(() => {
    if (!controller) return;
    if (muted || volume === 0) {
      const restoreVolume = previousVolume.current || 50;
      controller.unmute();
      controller.updateVolume(restoreVolume);
      setVolume(restoreVolume);
      setMuted(false);
    } else {
      previousVolume.current = volume;
      controller.updateVolume(0);
      controller.mute();
      setVolume(0);
      setMuted(true);
    }
    if (setShowControls) setShowControls(true);
  }, [controller, muted, volume, setShowControls]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, width: 100 }}>
      <div onClick={toggleMute} style={{ cursor: "pointer", color: "white" }}>
        {muted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
      </div>
      {!isIOS && (
        <input
          type="range"
          className="volume-slider"
          min={0}
          max={100}
          value={volume}
          onChange={handleChange}
          onMouseUp={handleChangeCommitted}
          onTouchEnd={handleChangeCommitted} // Hỗ trợ iOS
          aria-label="Volume"
        />
      )}
    </div>
  );
};
