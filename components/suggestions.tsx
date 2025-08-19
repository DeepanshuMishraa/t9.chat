import { Suggestion } from "./ai-elements/suggestion"

export default function SuggestionsList() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex flex-col items-start space-y-0 max-w-xl w-full">
        <Suggestion suggestion="what is the capital of france?" />
        <Suggestion suggestion="what is tcp and udp?" />
        <Suggestion suggestion="What is a geiger counter?" />
        <Suggestion suggestion="Is t3.chat better than Ai Feista by dhruv rathee?" />
      </div>
    </div>
  )
}
