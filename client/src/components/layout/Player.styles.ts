import styled from "styled-components";

export const StyledPlayer = styled.video`
  width: 100%;
  height: 100%;
  background-color: black;
  object-fit: contain;
`;

export const StyledContainer = styled.div<{ isIOS?: boolean }>`
  position: relative;
  max-width: 1000px;
  width: 100%;
  aspect-ratio: 16 / 9; /* Đảm bảo tỷ lệ khung hình 16:9 */
  background: black;
  margin: 0 auto;
  padding-bottom: ${({ isIOS }) => (isIOS ? "60px" : "0px")};
`;

export const StyledControls = styled.div<{ isIOS?: boolean }>`
  position: absolute;
  top: 0; /* Thanh điều khiển ở trên cùng */
  width: 100%;
  color: white;
  display: grid;
  z-index: 9999;
  grid-template-columns: ${({ isIOS }) =>
    isIOS ? "min-content 8fr 40px" : "min-content 1fr 8fr 40px"};
  grid-column-gap: 10px;
  // padding: 12px;
  padding: ${({ isIOS }) => (isIOS ? "" : "6px 12px")};
  box-sizing: border-box;
  background: linear-gradient(
    to bottom,
    rgba(64, 64, 64, 0.7),
    rgba(64, 64, 64, 0)
  );
  transition: opacity 0.3s ease;

  @media (max-width: 640px) {
    grid-template-columns: ${({ isIOS }) =>
      isIOS ? "min-content 90px 8fr 40px" : "min-content 8fr 60px 40px"};
    grid-column-gap: 4px;
  }
`;

export const PlayPauseButton = styled.button`
  border-radius: 4px;
  border: 0;
  padding: 4px 8px;
  box-sizing: border-box;
  color: white;
  min-width: 50px;
  // background-color: rgba(64, 64, 64, 0.7);
  cursor: pointer;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 640px) {
    padding: 15px 2px;
  }
`;

export const ProgressAndTimerContainer = styled.div`
  display: flex;
  // background-color: rgba(64, 64, 64, 0.7);
  padding: 4px 8px;
  padding-left: 0;
  border-radius: 4px;
`;

export const FullscreenButton = styled(PlayPauseButton)`
  padding: 0;
  min-width: initial;
`;

export const FirstPlayOverlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const FirstPlayButton = styled.button`
  font-size: 50px;
  background-color: black;
  outline: 0;
  color: white;
  padding: 12px 16px;
  border-radius: 2px;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 640px) {
    padding: 8px 12px;
    font-size: 20px;
  }
`;

export const IconOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 8;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  opacity: 1;
  animation: fadeOut 1s ease forwards;

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

export const StyledBanner = styled.div<{ isIOS?: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px; /* Chiều cao cố định cho banner */
  background-image: url("https://image-eu-na-ctnytbefjq.4shares.live/90link/8/1330t190.gif"); /* Đường dẫn đến ảnh GIF */
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  box-sizing: border-box;
  z-index: 5;
  font-size: 14px;
  font-weight: bold;

  & img {
    height: 40px; /* Điều chỉnh kích thước ảnh GIF */
    object-fit: contain;
  }

  @media (max-width: 640px) {
    height: 50px;
    font-size: 12px;
    padding: 0 10px;

    & img {
      height: 30px;
    }
  }
`;
