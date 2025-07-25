import styled from "styled-components";
import { StripValue, StripValueWrapper } from "../../styles/common.styles";

export const StyledStripeValue = styled(StripValue)`
  width: 0%;
  z-index: 1;
`;

export const StyledStripValueWrapper = styled(StripValueWrapper)`
  background-color: rgba(64, 64, 64, 0.7);
  border-radius: 3px;
`;
export const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const VolumeIcon = styled.div`
  cursor: pointer;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
`;
