'use server'

import { IconName } from "lucide-react/dynamic";

import { httpClient } from "@/lib/httpClient";
import { apiLogger } from "@/lib/logger";


type ProjectMetadata = {
  long_description: string;
  features: string[];
  technologies: string[];
  category: string
  iconName: IconName
};

export type GithubRepository = {
  title: string,
  full_name: string,
  description: string,
  icon: IconName,
  technologies: string[],
  features: string[],
  category: string
  link: string
}
const ONE_DAY = 24 * 60 * 60
export async function githubRepositories(): Promise<GithubRepository[] | null> {

  const [error, data] = await httpClient<GitHubRepository[]>('https://api.github.com/users/henriqueSydney/repos', {
    cache: 'force-cache',
    next: {
      revalidate: ONE_DAY,
      tags: ['git-hub-repos']
    }
  });

  if (error) {
    apiLogger.error({ stackTrace: error }, "Error fetching GitHub repositories");
    return null;
  }

  const projectsToShow = data.filter((project: GitHubRepository) =>
    project.topics.includes('portfolio') && project.visibility === 'public')

  const projectWithDetails: GithubRepository[] = []

  for (const project of projectsToShow) {
    const metadataUrl = `https://api.github.com/repos/${project.full_name}/contents/.github/metadata.json`;

    const [metadataError, metadataFile] = await httpClient<{
      content: string;
      encoding: string;
    }>(metadataUrl, {
      cache: 'force-cache',
      next: {
        revalidate: ONE_DAY,
        tags: [`git-hub-repos-metadata-${project.full_name}`]
      }
    });


    if (metadataError) {
      apiLogger.warn({ stackTrace: metadataError }, `No metadata for ${project.name}`);
      projectWithDetails.push({
        title: project.description || project.name,
        full_name: project.full_name,
        description: project.description || "Sem descrição",
        icon: 'search', // Default icon, can be customized later
        technologies: [],
        features: [],
        category: '', // Default category, can be customized later
        link: project.html_url
      });
      continue;
    }

    try {
      const binary = Uint8Array.from(atob(metadataFile.content), c => c.charCodeAt(0));
      const decoded = new TextDecoder('utf-8').decode(binary);
      const parsed: ProjectMetadata = JSON.parse(decoded);
      projectWithDetails.push({
        title: project.description || project.name,
        full_name: project.full_name,
        description: parsed.long_description || project.description || "Sem descrição",
        icon: parsed.iconName, // Default icon, can be customized later
        technologies: parsed.technologies || [],
        features: parsed.features || [],
        category: parsed.category || '',
        link: project.html_url
      });
    } catch (err) {
      apiLogger.error({ stackTrace: err }, `Error processing metadata for ${project.name}`);
      projectWithDetails.push({
        title: project.description || project.name,
        full_name: project.full_name,
        description: project.description || "Sem descrição",
        icon: 'search', // Default icon, can be customized later
        technologies: [],
        features: [],
        category: '', // Default category, can be customized later
        link: project.html_url
      });
    }

  }

  return projectWithDetails;
}