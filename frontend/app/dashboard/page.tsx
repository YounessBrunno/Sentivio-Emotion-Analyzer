import EmotionsChart from "features/video-analysis/components/EmotionsGraph";
import SessionInfo from "features/video-analysis/components/SessionInfo";
import SummaryCard from "features/video-analysis/components/SummaryCard";

export default function page() {
  return (
    <>
     <EmotionsChart />
     <SummaryCard />
     <SessionInfo />
    </>
  )
}