import { FC, useCallback, useEffect, useState } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import { VideoController } from "../controllers/video-controller";

interface Props {
  controller: VideoController | null;
}

const VolumeSlider = styled(Slider)({
  color: "white",
  height: 4,
  padding: "0px",
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

export const Volume: FC<Props> = ({ controller }) => {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(100); // giá trị mặc định

  // Sync controller volume khi mount
  useEffect(() => {
    if (controller) {
      const vol = controller.getVolume();
      setVolume(vol);
      setMuted(vol === 0);
    }
  }, [controller]);

  const handleChange = useCallback(
    (_: Event, value: number | number[]) => {
      if (!controller) return;
      const newVolume = typeof value === "number" ? value : value[0];
      controller.updateVolume(newVolume);
      setVolume(newVolume);
      setMuted(newVolume === 0);
    },
    [controller]
  );

  const toggleMute = useCallback(() => {
    if (!controller) return;
    if (muted) {
      controller.updateVolume(50); // restore volume
      setVolume(50);
      setMuted(false);
    } else {
      controller.updateVolume(0);
      setVolume(0);
      setMuted(true);
    }
  }, [controller, muted]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, width: 100 }}>
      <div onClick={toggleMute} style={{ cursor: "pointer", color: "white" }}>
        {muted ? <FaVolumeMute /> : <FaVolumeUp />}
      </div>
      <VolumeSlider
        min={0}
        max={100}
        value={volume}
        onChange={handleChange}
        aria-label="Volume"
      />
    </div>
  );
};
