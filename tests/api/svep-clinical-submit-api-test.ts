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

  const randomSuffix = Math.random().toString(36).substring(2, 7);

  const projectName = PROJECT_NAMES[arrayIndex];
  // const projectName = "Project-load-testing-0a98cd";

  // Set dynamic variables
  context.vars.jobName = `Job-${projectName}-pgx-${randomSuffix}`;
  context.vars.location = `s3://gaspi-dataportal-20250725085318492000000003/projects/${projectName}/project-files/rare_disease.vcf.gz`;
  context.vars.missingToRef = false;
  context.vars.projectName = projectName;
  context.vars.userId = "ap-southeast-3:30c5f016-6ed7-cc68-4932-038618b2788f";
  requestParams.url = `/submit`;

  // Debug logs
  console.log(
    `🎯 Loop ${currentLoop}/10 [Index: ${arrayIndex}] -> Project: ${projectName}`
  );
  next();
}
