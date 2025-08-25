import { PREFIX_S3_PATH, PROJECT_NAMES } from "./constants";

// processor.ts
interface Context {
  vars: Record<string, any>;
}

interface Events {
  emit: (event: string, data?: any) => void;
}

interface RequestParams {
  url: string;
  method: string;
  headers: Record<string, any>;
  json: any;
}

type DoneCallback = () => void;

export function setVariablesForNextProject(
  requestParams: RequestParams,
  context: Context,
  ee: Events,
  next: DoneCallback
): void {
  // Get current loop iteration (0-based, Artillery provides this)
  const currentLoop = context.vars.$loopCount || 1;
  const arrayIndex = currentLoop - 1; // Convert to 0-based index

  // Generate random suffix (5 characters)
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const projectName =
    PROJECT_NAMES[arrayIndex] || `Project-fallback-${currentLoop}`;

  // Set dynamic variables
  const datasetId = `${projectName}-${randomSuffix}`;
  context.vars.projectName = projectName;

  // Set S3 payload URL
  context.vars.s3PayloadUrl = `${PREFIX_S3_PATH}${projectName}/project-files/metadata.json`;

  // Create VCF locations array - Artillery can handle this better than array in variables
  context.vars.vcfLocationsList = [
    `${PREFIX_S3_PATH}${projectName}/project-files/pgx.vcf.gz`,
    `${PREFIX_S3_PATH}${projectName}/project-files/rare_disease.vcf.gz`,
    `${PREFIX_S3_PATH}${projectName}/project-files/chr1.vcf.gz`,
  ];

  const emails = ["devops@xapiens.id"];

  requestParams.url = `/dportal/admin/projects/${projectName}/users`;
  context.vars.emails = emails;

  // Debug logs
  console.log(
    `🎯 Loop ${currentLoop}/10 [Index: ${arrayIndex}] -> Project: ${projectName} -> ${emails}`
  );
  next();
}
