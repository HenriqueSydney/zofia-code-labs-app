import { getCachedSonarIssueAndQualityGate } from "../_data/get-issue-and-quality-gate";
import { ProjectLiveDetails } from "./ProjectLiveDetails";

interface IProjectLiveContainer {
  slug: string;
}

export async function ProjectLiveContainer({ slug }: IProjectLiveContainer) {
  const issueAndQualityGate = await getCachedSonarIssueAndQualityGate(slug);

  if (!issueAndQualityGate) return null;

  return (
    <ProjectLiveDetails
      issues={issueAndQualityGate.data.issues}
      qualityGate={issueAndQualityGate.data.qualityGate}
    />
  );
}
