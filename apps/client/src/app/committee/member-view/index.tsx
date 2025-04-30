import { LoadingText } from "@/components/misc/loading-text";
import { useUser } from "@/hooks/use-user";
import { useInitializedAppStore } from "@/lib/store";
import { flattenCountryInfo } from "../helpers";
import { VotingSessionActions } from "./voting-session-actions";

export function MemberView() {
  const currentVotingSessionId = useInitializedAppStore(
    (state) => state.currentVotingSessionId
  );
  return (
    <div className="flex flex-col gap-6">
      <CountryInfo />
      {currentVotingSessionId ? (
        <VotingSessionActions id={currentVotingSessionId} />
      ) : (
        <LoadingText>Waiting for actions...</LoadingText>
      )}
    </div>
  );
}
function CountryInfo() {
  const { countryCode } = useUser(true);

  const { customCountries } = useInitializedAppStore(
    (state) => state.committee
  );
  const { name, imageUrl } = flattenCountryInfo(customCountries)(countryCode);
  return (
    <div className="flex items-center gap-2 w-full justify-center">
      <img src={imageUrl} alt={name} className="h-6 rounded-sm object-cover" />
      <p className="text-base">{name}</p>
    </div>
  );
}
