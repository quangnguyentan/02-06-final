import { CreateSportModal } from "../modals/sport-modal/create-sport-modal";
import { DeleteSportModal } from "../modals/sport-modal/delete-sport-modal";
import { EditSportModal } from "../modals/sport-modal/edit-sport-modal";
import { CreateUserModal } from "../modals/user-modal/create-user-modal";
import { DeleteUserModal } from "../modals/user-modal/delete-user-modal";
import { EditUserModal } from "../modals/user-modal/edit-user-modal";
import { CreateMatchModal } from "../modals/match-modal/create-match-modal";
import { DeleteMatchModal } from "../modals/match-modal/delete-match-modal";
import { EditMatchModal } from "../modals/match-modal/edit-match-modal";
import { CreateTeamModal } from "../modals/team-modal/create-team-modal";
import { DeleteTeamModal } from "../modals/team-modal/delete-team-modal";
import { EditTeamModal } from "../modals/team-modal/edit-team-modal";
import { CreateReplayModal } from "../modals/replay-modal/create-replay-modal";
import { DeleteReplayModal } from "../modals/replay-modal/delete-replay-modal";
import { EditReplayModal } from "../modals/replay-modal/edit-replay-modal";
import { CreateLeagueModal } from "../modals/league-modal/create-league-modal";
import { DeleteLeagueModal } from "../modals/league-modal/delete-league-modal";
import { EditLeagueModal } from "../modals/league-modal/edit-league-modal";
import { CreateVideoReelModal } from "../modals/videoReel-modal/create-videoReel-modal";
import { DeleteVideoReelModal } from "../modals/videoReel-modal/delete-videoReel-modal";
import { EditVideoReelModal } from "../modals/videoReel-modal/edit-videoReel-modal";
import { CreateBannerModal } from "../modals/banner-modal/create-banner-modal";
import { EditBannerModal } from "../modals/banner-modal/edit-banner-modal";
import { DeleteBannerModal } from "../modals/banner-modal/delete-banner-modal";
const ModalProvider = () => {
  return (
    <>
      <CreateUserModal />
      <EditUserModal />
      <DeleteUserModal />
      <CreateSportModal />
      <EditSportModal />
      <DeleteSportModal />
      <CreateMatchModal />
      <EditMatchModal />
      <DeleteMatchModal />
      <CreateTeamModal />
      <EditTeamModal />
      <DeleteTeamModal />
      <CreateReplayModal />
      <EditReplayModal />
      <DeleteReplayModal />
      <CreateLeagueModal />
      <EditLeagueModal />
      <DeleteLeagueModal />
      <CreateVideoReelModal />
      <DeleteVideoReelModal />
      <EditVideoReelModal />
      <CreateBannerModal />
      <EditBannerModal />
      <DeleteBannerModal />
    </>
  );
};

export default ModalProvider;
