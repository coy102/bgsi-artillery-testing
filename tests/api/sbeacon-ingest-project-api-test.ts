import { PREFIX_S3_PATH, PROJECT_NAME_INPUT } from "./constants";

// processor.ts
interface Context {
  vars: Record<string, any>;
}

interface Events {
  emit: (event: string, data?: any) => void;
}

type DoneCallback = () => void;

export function setAllVariables(
  context: Context,
  events: Events,
  done: DoneCallback
): void {
  // Generate random suffix (5 characters)
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const PROJECT_NAME = PROJECT_NAME_INPUT;

  // Set dynamic variables
  context.vars.datasetId = `${PROJECT_NAME}-${randomSuffix}`;
  context.vars.projectName = PROJECT_NAME;

  // Set S3 payload URL
  context.vars.s3PayloadUrl = `${PREFIX_S3_PATH}${PROJECT_NAME}/project-files/metadata.json`;

  // Create VCF locations array - Artillery can handle this better than array in variables
  context.vars.vcfLocationsList = [
    `${PREFIX_S3_PATH}${PROJECT_NAME}/project-files/pgx.vcf.gz`,
    `${PREFIX_S3_PATH}${PROJECT_NAME}/project-files/rare_disease.vcf.gz`,
    `${PREFIX_S3_PATH}${PROJECT_NAME}/project-files/chr1.vcf.gz`,
  ];

  done();
}
