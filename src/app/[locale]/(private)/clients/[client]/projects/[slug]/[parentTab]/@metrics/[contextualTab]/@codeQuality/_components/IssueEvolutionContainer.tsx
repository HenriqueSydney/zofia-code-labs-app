import { getCachedSonarHistory } from "../_data/get-sonarqube-history";
import { IssueEvolutionChart } from "./IssueEvolutionChart";

interface IIssueEvolutionContainer {
  slug: string;
}

export async function IssueEvolutionContainer({
  slug,
}: IIssueEvolutionContainer) {
  const history = await getCachedSonarHistory(slug);

  if (!history) return null;

  return (
    <div className="lg:col-span-4">
      <IssueEvolutionChart data={history.data} />
    </div>
  );
}
