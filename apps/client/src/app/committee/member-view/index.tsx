import { useUser } from "@/hooks/use-user";
import { useInitializedAppStore } from "@/lib/store";
import { flattenCountryInfo } from "../helpers";
import { VotingSessionActions } from "./voting-session-actions";

export function MemberView() {
  const currentVotingSessionId = useInitializedAppStore(
    (state) => state.currentVotingSessionId
  );
  return (
    <div className="flex flex-col gap-2">
      <CountryInfo />
      {currentVotingSessionId && (
        <VotingSessionActions id={currentVotingSessionId} />
      )}
    </div>
  );
}
function CountryInfo() {
  const { countryCode } = useUser(true);

  const { customCountries } = useInitializedAppStore(
    (state) => state.committee
  );
  const { name, imageUrl } = flattenCountryInfo(countryCode, customCountries);
  return (
    <div className="flex items-center gap-3 w-full justify-center">
      <img src={imageUrl} alt={name} className="h-6 rounded-sm object-cover" />
      <p className="text-base">{name}</p>
    </div>
  );
}
