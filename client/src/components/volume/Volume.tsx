import { FC, useCallback, useEffect, useRef, useState } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import { VideoController } from "../controllers/video-controller";
import { SyntheticEvent } from "react"; // Thêm import SyntheticEvent

interface Props {
  controller: VideoController | null;
  setShowControls?: (value: boolean) => void;
}

const VolumeSlider = styled(Slider)({
  color: "white",
  height: 4,
  padding: "0",
  "& .MuiSlider-thumb": {
    width: 10,
    height: 10,
    backgroundColor: "white",
  },
  "& .MuiSlider-rail": {
    opacity: 0.3,
    backgroundColor: "gray",
  },
  "& .MuiSlider-track": {
    backgroundColor: "white",
  },
});

export const Volume: FC<Props> = ({ controller, setShowControls }) => {
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

  const handleChangeCommitted = useCallback(
    (
      event: Event | SyntheticEvent<Element, Event>,
      value: number | number[]
    ) => {
      if (!controller) return;
      const newVolume = typeof value === "number" ? value : value[0];
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
      {/* <VolumeSlider
        min={0}
        max={100}
        value={volume}
        onChangeCommitted={handleChangeCommitted}
        onChange={(_, value) =>
          setVolume(typeof value === "number" ? value : value[0])
        }
        aria-label="Volume"
      /> */}
    </div>
  );
};
